// install.js
// XpiInstaller
// From http://kb.mozillazine.org/Install.js
// By Pike (Heavily inspired by code from Henrik Gemal and Stephen Clavering)
// Minor mods by Nagarjuna Venna for Padma

var XpiInstaller = {
    // --- Editable items begin ---
    extFullName: 'Padma', // The name displayed to the user (don't include the version)
    extShortName: 'padma', // The leafname of the JAR file (without the .jar part)
    extVersion: '0.4.11',
    extAuthor: 'Nagarjuna Venna', 
    extLocaleNames: null, // e.g. ['en-US', 'en-GB']
    extSkinNames: null, // e.g. ['classic', 'modern']
    // --- Editable items end ---
	
    profileInstall: true,
    silentInstall: false,
	
    install: function()	{
        var jarName = this.extShortName + '.jar';
        var profileDir = Install.getFolder('Profile', 'chrome');

        // Parse HTTP arguments
        this.parseArguments();
		
        // Check if extension is already installed in profile
        if (File.exists(Install.getFolder(profileDir, jarName))) {
            if (!this.silentInstall) {
                Install.alert('Updating existing Profile install of ' + this.extFullName + ' to version ' + this.extVersion + '.');
            }
            this.profileInstall = true;
        }
        else if (!this.silentInstall) {
            // Ask user for install location, profile or browser dir?
            this.profileInstall = Install.confirm('Click on OK to install ' + this.extFullName + ' ' + this.extVersion + 
                                                  ' to your Profile directory (won\'t have to reinstall if updating browser).' +
                                                  ' \nClick on Cancel to install to your Browser directory?');
        }
		
        // Init install
        var dispName = this.extFullName + ' ' + this.extVersion;
        var regName = '/' + this.extAuthor + '/' + this.extShortName;
        Install.initInstall(dispName, regName, this.extVersion);
		
        // Find directory to install into
        var installPath;
        if (this.profileInstall) 
            installPath = profileDir;
        else installPath = Install.getFolder('chrome');
		
        // Add JAR file
        Install.addFile(null, 'chrome/' + jarName, installPath, null);
		
        // Register chrome
        var jarPath = Install.getFolder(installPath, jarName);
        var installType = this.profileInstall ? Install.PROFILE_CHROME : Install.DELAYED_CHROME;
        
        // Register content
        Install.registerChrome(Install.CONTENT | installType, jarPath, 'content/');
		
        // Register locales
        for (var locale in this.extLocaleNames) {
            var regPath = 'locale/' + this.extLocaleNames[locale] + '/' + this.extShortName + '/';
            Install.registerChrome(Install.LOCALE | installType, jarPath, regPath);
        }
		
        // Register skins
        for (var skin in this.extSkinNames) {
            var regPath = 'skin/' + this.extSkinNames[skin] + '/' + this.extShortName + '/';
            Install.registerChrome(Install.SKIN | installType, jarPath, regPath);
        }

        // Add prefs file
        var prefDir = (this.profileInstall) ? getFolder(getFolder('Profile'), 'pref') 
                                            : getFolder(getFolder(getFolder('Program'), 'defaults'), 'pref');
        if (!File.exists(prefDir)) 
            File.dirCreate(prefDir);
        Install.addFile(null, 'defaults/preferences/' + this.extShortName + '.js', prefDir, null);
        
        // Perform install
        var err = Install.performInstall();
        if (err == Install.SUCCESS || err == Install.REBOOT_NEEDED) {
            if (!this.silentInstall) {
                Install.alert(dispName + ' is now installed. \n Restart browser to activate.');
            }
        }
        else {
            this.handleError(err);
            return;
        }
    },
	
    parseArguments: function() {
        // Can't use string handling in install, so use if statement instead
        var args = Install.arguments;
        if (args == 'p=0') {
            this.profileInstall = false;
            this.silentInstall = true;
        }
        else if (args == 'p=1') {
            this.profileInstall = true;
            this.silentInstall = true;
        }
    },
	
    handleError: function(err) {
        if (!this.silentInstall) {
            Install.alert('Error: Could not install ' + this.extFullName + ' ' + this.extVersion + ' (Error code: ' + err + ')');
        }
        Install.cancelInstall(err);
    }
};

XpiInstaller.install();
