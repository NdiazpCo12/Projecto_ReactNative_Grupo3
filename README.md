# Projecto_ReactNative_Grupo3

Aplicación React Native / Expo para el apartado de estudiante de Peer Assessment App.

Esta app se conecta a la misma base Roble usada por el proyecto Flutter original y permite que el estudiante:

- Inicie sesión con Roble.
- Consulte cursos y grupos asignados.
- Revise evaluaciones disponibles.
- Califique a sus compañeros de grupo.
- Envíe evaluaciones a Roble.
- Consulte resultados públicos por curso.
- Gestione perfil y cierre de sesión.

Link de Sustentacion (Video Funcionamiento PeerAssessment App StudentViews) : https://youtu.be/HyCaMVXLSMg

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation
- AsyncStorage
- Axios
- Lucide React Native
- React Native SVG

## Instalación

```bash
npm install
```

## Comandos

```bash
npm start
npm run android
npm run ios
npm run web
npm run typecheck
```


## Tablas Roble usadas

- `students`
- `group_members`
- `course_groups`
- `group_categories`
- `courses`
- `assessments`
- `assessment_criteria`
- `assessment_criterion_levels`
- `assessment_submissions`
- `assessment_peer_reviews`
- `assessment_scores`

## Nota

El login usa la contraseña por defecto que ya utiliza el proyecto Flutter: `ThePassword!1`.
Solo se permite acceso a usuarios con rol `estudiante`, `student` o `alumno`.
