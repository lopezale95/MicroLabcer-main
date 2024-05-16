import { Component, OnInit, inject } from '@angular/core';
import { signOut } from 'firebase/auth';

import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateCertificateComponent } from '../../../shared/components/add-update-certificate/add-update-certificate.component';
import { getDoc } from 'firebase/firestore';
import { Certificate } from 'src/app/models/certificate.model';
import {orderBy}from 'firebase/firestore';
import { Filesystem, Directory, Encoding as FilesystemEncoding} from '@capacitor/filesystem';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {


  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  image: string = 'assets/background.jpg';
  certificates:Certificate[]=[];
  loading: boolean=false;

  ngOnInit() {}

  user(): User{
    return this.utilsSvc.getFronLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getDoc();
  }

  doRefresh(event) {
   
    setTimeout(() => {
      this.getDoc();
      event.target.complete();
    }, 1000);
  }

 

  //=============Obtener Documentos =============
  
  getDoc(){
    let path= `user/${this.user().uid}/certicate`;

    this.loading=true;

    let query = (orderBy('serial','desc'))

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any)=>{
        console.log(res);
        this.certificates =res;

        this.loading=false;

        sub.unsubscribe();
      }
    })
  }

  //=============Agregar o actualizar Certificados =============
  async AddUpdateCertificate(certificate?: Certificate){
    let success =await this.utilsSvc.presentModal({
      component: AddUpdateCertificateComponent,
      cssClass:'add-update-modal',
      componentProps: {certificate}
    })

    if(success) this.getDoc();

  }

  //======Confirmar la eliminación del certificado =======
  async confirmDeleteCertificate(certificate: Certificate) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Certificado',
      message: 'Quieres eliminar este certificado',
      mode:'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, Eliminar',
          handler: () => {
            this.deleteCertificate(certificate)
          }
        }
      ]
    });
  }

  
  //======Eliminar Certificado==========
  async deleteCertificate(certificate: Certificate) {


    let path= `user/${this.user().uid}/certicate/${certificate.id}`

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let docPath = await this.firebaseSvc.getFilePath(certificate.doc);
    await this.firebaseSvc.deleteFile(docPath);

    this.firebaseSvc.deleteDocument(path).then(async res=>{
    
      this.certificates = this.certificates.filter(c => c.id !== certificate.id);

      this.utilsSvc.presentToast({
        message: 'Certificado eliminado exitosamente',
        duration: 2000,
        color:'primary',
        position:'middle',
        icon:'checkmark-circle-outline'
        })

    }).catch(error =>{
      console.log(error);

      this.utilsSvc.presentToast({
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

async downloadCertificate(certificate: Certificate) {
  const docUrl = certificate.doc; // URL del certificado en Firebase Storage
  const fileName = `certificate_${certificate.serial}.pdf`; // Nombre del archivo

  try {
    const response = await fetch(docUrl);
    const data = await response.blob();

    await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Documents,
      encoding: FilesystemEncoding.UTF8
    });

    console.log('Certificado descargado exitosamente:', fileName);
  } catch (error) {
    console.error('Error al descargar el certificado:', error);
  }
}


}
