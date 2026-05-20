# Biometric Authentication

Este documento describe la implementacion de ingreso biometrico para la app Peer Assessment Student.

## Objetivo

El login biometrico funciona como reingreso local a una sesion ya validada por Roble. La primera vez el estudiante inicia sesion normalmente; despues puede activar `Biometric Verification` desde Perfil.

## Dependencias

```bash
npx expo install expo-local-authentication expo-secure-store
```

- `expo-local-authentication`: abre el prompt nativo de Face ID, Touch ID, huella, iris o biometria disponible.
- `expo-secure-store`: guarda tokens de sesion de forma mas segura que AsyncStorage.

## Flujo

```text
Primera vez:
Login normal con credenciales/correo
Roble valida usuario, rol y tokens
El usuario entra a la app
Desde Perfil activa Biometric Verification
La app pide biometria una vez
Si pasa, guarda preferencia y sesion segura

Siguientes ingresos:
Pantalla de login
Boton Ingresar con verificacion biometrica
Prompt nativo del dispositivo
Si pasa, se verifica o refresca el token
Si la sesion es valida, entra a la app
```


## Android

Android es la primera plataforma recomendada para pruebas.

La autenticacion usa nivel `weak` en Android para mejorar compatibilidad con dispositivos que tienen reconocimiento facial basico. Esto puede permitir face unlock por camara, pero el sistema operativo sigue decidiendo si muestra rostro, huella, patron, PIN o fallback.


## iOS 

Ruta realista sin Apple Developer Program:

Limitacion:

```text
Face ID en iOS no se puede probar completamente en Expo Go.
```
```
Para iPhone fisico con EAS se requiere Apple Developer Program. Para build local se requiere macOS con Xcode.

## Seguridad

- La app no guarda rostro, huellas ni datos biometricos.
- La biometria la maneja iOS o Android mediante el prompt nativo.
- En Android se prioriza compatibilidad sobre maxima seguridad para permitir biometria `weak` cuando el dispositivo la soporte.
- Los tokens se guardan en `expo-secure-store`.
- La preferencia `biometricLoginEnabled` se guarda en AsyncStorage porque no es un secreto critico.
- Antes de entrar con biometria, la app valida el token con Roble o intenta refrescarlo.
- Si `Biometric Verification` esta activo, `Log Out` funciona como salida local: vuelve al login pero conserva la sesion segura para permitir el reingreso biometrico.
- Si `Biometric Verification` esta desactivado, `Log Out` cierra sesion contra Roble y limpia la sesion local.


