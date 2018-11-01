VERSION=`cut -d '"' -f2 $BUILDDIR/../version.js`
GREEN=\033[0;32m
CLOSECOLOR=\033[0m

UNAME := $(shell uname)

ifeq ($(UNAME), Linux)
  SHELLCMD := bash
endif

ifeq ($(UNAME), Darwin)
  SHELLCMD := sh
endif

prepare-dev:
	$(SHELLCMD) devbuilds/prepare-dev.sh live

prepare-dev-tn:
	$(SHELLCMD) devbuilds/prepare-dev.sh testnet
	@echo "$(GREEN)Generating testnet configuration...$(CLOSECOLOR)"
	$(SHELLCMD) devbuilds/testnetify.sh
	@echo "$(GREEN)Done. You can start wallet now. $(CLOSECOLOR)"

prepare-package:
	$(SHELLCMD) devbuilds/prepare-package.sh live

prepare-package-tn:
	$(SHELLCMD) devbuilds/prepare-package.sh testnet

# prepares .deb package for live
prepare-package-deb:
	$(SHELLCMD) devbuilds/prepare-package-deb.sh live

# prepares .deb package for testnet
prepare-package-deb-tn:
	$(SHELLCMD) devbuilds/prepare-package-deb.sh testnet

ios-prod:
	cordova/build.sh IOS simpa-wallet --clear live
	cd ./cordova/project-IOS && cordova build ios

ios-debug:
	cordova/build.sh IOS simpa-wallet --dbgjs testnet
	cd ./cordova/project-IOS  && cordova build ios
	# open ./cordova/project-IOS/platforms/ios/SimpaWallet.xcodeproj

android-prod:
#	cordova/build.sh ANDROID simpa-wallet --clear live
#	cd ./cordova/project-ANDROID  && cordova build --release android
		cordova/build.sh ANDROID simpa-wallet --clear live

	cd ./cordova/project-ANDROID && cordova build --release android
	
	
	
#   keytool -genkey -v -keystore <keystore_name>.keystore -alias <keystore alias> -keyalg RSA -keysize 2048 -validity 10000
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore simpa-wallet.jks -tsa http://sha256timestamp.ws.symantec.com/sha256/timestamp -signedjar ./cordova/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed.apk  ./cordova/project-ANDROID/platforms/android/build/outputs/apk/android-release-unsigned.apk simpa-wallet
	$(ANDROID_HOME)/build-tools/25.0.3/zipalign -v 4 ./cordova/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed.apk ./cordova/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed-aligned.apk

android-prod-tn:
	cordova/build.sh ANDROID simpa-wallet --clear testnet
	cd ./cordova/project-ANDROID  && cordova build --release android
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore simpa-wallet.jks -tsa http://sha256timestamp.ws.symantec.com/sha256/timestamp -signedjar ../byteballbuilds/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed.apk  ../byteballbuilds/project-ANDROID/platforms/android/build/outputs/apk/android-release-unsigned.apk simpa-wallet
	$(ANDROID_HOME)/build-tools/25.0.3/zipalign -v 4 ../byteballbuilds/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed.apk ../byteballbuilds/project-ANDROID/platforms/android/build/outputs/apk/android-release-signed-aligned.apk

android-debug:
	cordova/build.sh ANDROID dagcoin --clear live
	cd ./cordova/project-ANDROID  && cordova build android

android-debug-fast-tn:
	cordova/build.sh ANDROID simpa-wallet --dbgjs testnet
	cd ./cordova/project-ANDROID && cordova run android --device
#	cd ../byteballbuilds/project-ANDROID && cordova build android

android-debug-fast-emulator-tn:
	cordova/build.sh ANDROID simpa-wallet --dbgjs testnet
	cd ./cordova/project-ANDROID && cordova emulate android
