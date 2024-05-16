import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, audit } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
FirebaseSvc = inject (FirebaseService);
  utilsSvc = inject (UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      return new Promise((resolve)=>{
      
      this.FirebaseSvc.getAuth().onAuthStateChanged((auth)=>{
        if(!auth) resolve(true);
        
        else{
          this.utilsSvc.routerLink('/main/home');
          resolve(false);
        }
      })
    });
  }
  
}