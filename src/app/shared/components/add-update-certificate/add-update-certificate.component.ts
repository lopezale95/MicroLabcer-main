import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Filesystem,Directory,Encoding } from '@capacitor/filesystem';
import { Certificate } from '../../../models/certificate.model';

@Component({
  selector: 'app-add-update-certificate',
  templateUrl: './add-update-certificate.component.html',
  styleUrls: ['./add-update-certificate.component.scss'],
})
export class AddUpdateCertificateComponent  implements OnInit {

  @Input() certificate: Certificate;

  form = new FormGroup({
    id: new FormControl(''),
    serial: new FormControl('', [Validators.required, Validators.minLength(3)]),
    customer: new FormControl('', [Validators.required, Validators.minLength(4)]),
    doc: new FormControl('', [Validators.required]),
    
  });

  firebaseSvc = inject(FirebaseService);
  UtilsSvc = inject(UtilsService);

  user = {} as User;

  image:any;

  ngOnInit() {
    this.user = this.UtilsSvc.getFronLocalStorage('user');
    if(this.certificate) this.form.setValue(this.certificate);
    this.image="https://microlink.com.co/wp-content/uploads/2022/04/Quienes-somos-opcion-1.jpg";
  }
  changeImage(){
    this.image="https://microlink.com.co//wp-content/uploads/2022/03/Catalogo-MPO-2020-1.jpg";
  }
  
  //=========seleccionar Archivos=========
  async selectFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf'; // Permite seleccionar solo archivos PDF
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files[0];
      if (file) {
        const dataUrl = await this.readFile(file);
        // No se muestra la vista previa de la imagen
        // this.image = dataUrl;
        this.form.controls.doc.setValue(dataUrl);
      }
    };
    input.click();
  }
  // Método para leer el contenido del archivo
  async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  submit(){
    if(this.form.valid){
      if(this.certificate) this.updateCertificate();
      else this.createCertificate()
    }
  }

  

  //======Crear Certificado==========
  async createCertificate() {

      let path= `user/${this.user.uid}/certicate`

      const loading = await this.UtilsSvc.loading();
      await loading.present();

      //====== Subir el documento y obtener la URL =========

      let dataUrl = this.form.value.doc;
      let docPath = `${this.user.uid}/${Date.now()}`;
      let docUrl = await this.firebaseSvc.uploadImage(docPath,dataUrl);
      this.form.controls.doc.setValue(docUrl);

      delete this.form.value.id

      this.firebaseSvc.addDocument(path, this.form.value).then(async res=>{
      
        this.UtilsSvc.dismissModal({success:true});

        this.UtilsSvc.presentToast({
          message: 'Certificado subido exitosamente',
          duration: 2000,
          color:'primary',
          position:'middle',
          icon:'checkmark-circle-outline'
          })

      }).catch(error =>{
        console.log(error);

        this.UtilsSvc.presentToast({
        message: error.message,
        duration: 4000,
        color:'primary',
        position:'middle',
        icon:'alert-circle-outline'
        })

      }).finally(()=>{
        loading.dismiss();
      })
    
  }

  //======Actualizar Certificado==========
  async updateCertificate() {


      let path= `user/${this.user.uid}/certicate/${this.certificate.id}`

      const loading = await this.UtilsSvc.loading();
      await loading.present();

      //====== Si cambio el archivo, Subir el nuevo documento y obtener la URL =========
      if (this.form.value.doc !== this.certificate.doc){
        let dataUrl = this.form.value.doc;
        let docPath = await this.firebaseSvc.getFilePath(this.certificate.doc);
        let docUrl = await this.firebaseSvc.uploadImage(docPath,dataUrl);
        this.form.controls.doc.setValue(docUrl);
      }
    

      delete this.form.value.id

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res=>{
      
        this.UtilsSvc.dismissModal({success:true});

        this.UtilsSvc.presentToast({
          message: 'Certificado actualizado exitosamente',
          duration: 2000,
          color:'primary',
          position:'middle',
          icon:'checkmark-circle-outline'
          })

      }).catch(error =>{
        console.log(error);

        this.UtilsSvc.presentToast({
        message: error.message,
        duration: 4000,
        color:'primary',
        position:'middle',
        icon:'alert-circle-outline'
        })

      }).finally(()=>{
        loading.dismiss();
      })
  }

 
}