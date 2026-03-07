# Top Congo Mobile

Application mobile React Native basee sur Expo.
Version Expo du projet : `~55.0.5` (SDK 55).

## Prerequis

- Node.js 20+ et npm
- Android Studio (SDK Android installe)
- JDK (Android Studio inclut `jbr`)

## Installation

```bash
npm install
```

## Scripts utiles

- `npm run start` : lance le serveur Expo
- `npm run android` : build + lance l'app Android (`expo run:android`)
- `npm run ios` : build + lance l'app iOS (`expo run:ios`)
- `npm run web` : lance la version web
- `npm run lint` : lance ESLint via Expo

## Environment variables (Expo)

Expo charge automatiquement les fichiers `.env` du projet.

1. Copier l'exemple et creer votre fichier local:

```bash
cp .env.example .env.local
```

2. Utiliser uniquement le prefixe `EXPO_PUBLIC_` pour les variables lues dans le code client:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

3. Redemarrer le serveur Expo apres modification des variables.



## Configuration Android (Windows)

Si vous voyez l'erreur `JAVA_HOME is not set`, configurez les variables suivantes dans un terminal PowerShell :

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"
```

Puis lancez :

```bash
npm run android
```

Le projet peut aussi utiliser `android/local.properties` avec :

```properties
sdk.dir=C:/Users/<your-user>/AppData/Local/Android/Sdk
```

## Notes

- iOS necessite macOS + Xcode.
- Le dossier `android/` est genere localement et ignore par git dans ce projet.
