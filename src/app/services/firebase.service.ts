import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getAuth } from 'firebase/auth';
import { getStorage, uploadString, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  UtilsSvc = inject(UtilsService);

  constructor(private angularFireStorage: AngularFireStorage) {}

  // Método para obtener una referencia a un archivo en Firebase Storage
  getStorageRef(filePath: string) {
    return ref(getStorage(), filePath);
  }

  // Método para subir un archivo a Firebase Storage
  async uploadFile(filePath: string, file: File) {
    // Lee el contenido del archivo como una URL de datos
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Sube la URL de datos a Firebase Storage
      return uploadString(
        ref(getStorage(), filePath),
        dataUrl,
        'data_url'
      ).then(() => {
        return getDownloadURL(ref(getStorage(), filePath));
      });
    };
  }
  // Método para descargar un archivo desde Firebase Storage
  async downloadFile(filePath: string) {
    return getDownloadURL(ref(getStorage(), filePath));
  }

  //==============Autenticación================
  getAuth() {
    return getAuth();
  }
  //==============Acceder==================
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //==============Crear Usuario==================
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //============Actualizar Usuario=============
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  //=========Restablecer contraseña=========

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }
  //===========Cerrar Sesión=============
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.UtilsSvc.routerLink('/auth');
  }
  //============Base de Datos=============

  //=====Obtener documentos de una colección=====

  getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery), { idField: 'id' });
  }

  //============Setear un documento=============

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  //============Actualizar un documento=============

  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

  //============Eliminar un documento=============

  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  //=========Obtener un documento=========
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  //=========Agregar un documento=========
  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  //=========Almacenamiento=========

  //======Subir Imagen=====
  async uploadImage(path: string, data_url: string) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  //======Obtener ruta de la imagen con su url=====

  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  //======Eliminar archivo=====

  deleteFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }

}
