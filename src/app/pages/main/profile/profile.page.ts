import { Component, Input, OnInit, inject, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  
})
export class ProfilePage implements OnInit {
 firebaseSvc = inject(FirebaseService);
  UtilsSvc = inject(UtilsService);
  
  ngOnInit() {
  }

  user(): User {
    return this.UtilsSvc.getFronLocalStorage('user');
  }

  //=============Tomar/Seleccionar Imagen ==============
  async takeImage(){

    let user = this.user();

    let path = `users/${user.uid}` 

    const dataUrl = (await this.UtilsSvc.takePicture('Imagen de Perfil')).dataUrl;
    
    const loading = await this.UtilsSvc.loading();
    await loading.present();

    let imagePath = `${user.uid}/profile`;
      user.image = await this.firebaseSvc.uploadImage(imagePath,dataUrl);

      this.firebaseSvc.updateDocument(path, {image:user.image}).then(async res=>{
        
        this.UtilsSvc.saveInLocalStorage('user',user);

        this.UtilsSvc.presentToast({
          message: 'Imagen actualizada exitosamente',
          duration: 1500,
          color:'success',
          position:'middle',
          icon:'checkmark-circle-outline'
          })

      }).catch(error =>{
        console.log(error);

        this.UtilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color:'primary',
        position:'middle',
        icon:'alert-circle-outline'
        })

      }).finally(()=>{
        loading.dismiss();
      })  
  }


}