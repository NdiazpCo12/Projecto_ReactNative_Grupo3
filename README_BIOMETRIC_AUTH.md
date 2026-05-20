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

## Archivos Agregados

```text
src/core/security/BiometricService.ts
src/core/local/SecureSessionStorage.ts
src/core/local/BiometricPreferences.ts
```

## Archivos Modificados

```text
app.json
package.json
package-lock.json
src/core/di/container.ts
src/features/auth/data/datasources/authDatasource.ts
src/features/auth/presentation/context/AuthContext.tsx
src/features/auth/presentation/screens/LoginScreen.tsx
src/features/student/presentation/screens/ProfileScreen.tsx
```

## Android

Android es la primera plataforma recomendada para pruebas.

Checklist:

```text
Dispositivo o emulador Android
Biometria configurada en el sistema
Login normal funcionando
Usuario estudiante valido en Roble
```

Comandos:

```bash
npm install
npx expo start
```

Pruebas:

```text
1. Iniciar sesion normalmente.
2. Ir a Perfil.
3. Activar Biometric Verification.
4. Aceptar el prompt biometrico.
5. Cerrar y volver a abrir la app.
6. Usar Ingresar con verificacion biometrica.
7. Confirmar que entra a cursos, evaluaciones y resultados.
```

## iOS Sin Paga

Ruta realista sin Apple Developer Program:

```text
Implementar codigo compatible con iOS
Configurar app.json con permiso Face ID
Probar UI, navegacion y boton biometrico en iPhone con Expo Go
Dejar Face ID pendiente de validacion real
Validar mas adelante con Mac + Xcode o Apple Developer Program + EAS
```

Limitacion:

```text
Face ID en iOS no se puede probar completamente en Expo Go.
```

## iOS Con Development Build Futuro

Cuando se vaya a validar Face ID real en iPhone:

```bash
npx expo install expo-dev-client
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
npx expo start --dev-client
```

Para iPhone fisico con EAS se requiere Apple Developer Program. Para build local se requiere macOS con Xcode.

## Seguridad

- La app no guarda rostro, huellas ni datos biometricos.
- La biometria la maneja iOS o Android mediante el prompt nativo.
- Los tokens se guardan en `expo-secure-store`.
- La preferencia `biometricLoginEnabled` se guarda en AsyncStorage porque no es un secreto critico.
- Antes de entrar con biometria, la app valida el token con Roble o intenta refrescarlo.
- Si `Biometric Verification` esta activo, `Log Out` funciona como salida local: vuelve al login pero conserva la sesion segura para permitir el reingreso biometrico.
- Si `Biometric Verification` esta desactivado, `Log Out` cierra sesion contra Roble y limpia la sesion local.

## Verificacion Tecnica

```bash
npm run typecheck
```
