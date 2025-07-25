var File = Java.type("java.io.File");
var URLClassLoader = Java.type("java.net.URLClassLoader");
var Thread = Java.type("java.lang.Thread");
var Class = Java.type("java.lang.Class");

var loadedClassLoader = null;


function loadJarsFromRepository(dirPath) {
    var libDir = new File(dirPath);
    if (!libDir.exists() || !libDir.isDirectory()) {
        print("❌ Directory not found: " + dirPath);
        return false;
    }

    var FileFilter = Java.type("java.io.FileFilter");

    var filterImpl = new (Java.extend(FileFilter))({
        accept: function(file) {
            return file.getName().toLowerCase().endsWith(".jar");
        }
    });

    var jarFiles = libDir.listFiles(filterImpl);

    if (!jarFiles || jarFiles.length === 0) {
        print("⚠️ No JAR files found in: " + dirPath);
        return false;
    }

    try {
        var urls = [];
        for each (var jarFile in jarFiles) {
            urls.push(jarFile.toURI().toURL());
            print("✔️ Found JAR: " + jarFile.getName());
        }

        loadedClassLoader = new URLClassLoader(urls, Thread.currentThread().getContextClassLoader());
        Thread.currentThread().setContextClassLoader(loadedClassLoader);

        print("✅ Loaded " + urls.length + " JAR(s) from: " + dirPath);
        return true;
    } catch (e) {
        print("❌ Failed to load JARs: " + e.message);
        return false;
    }
}


function plugin(className) {
    if (!loadedClassLoader) {
        print("❌ No classloader initialized.");
        return null;
    }

    try {
        var cls = Class.forName(className, true, loadedClassLoader);
        return cls.getDeclaredConstructor().newInstance();
    } catch (e) {
        print("❌ Failed to instantiate class: " + className);
        print("   Error: " + e.message);
        return null;
    }
}

// === Example usage ===

var repoPath = "C:/Users/bb25004/items/dev/TALON/VCC/lib"
if (loadJarsFromRepository(repoPath)) {
    var instance = plugin("org.example.core.PlatformInfo");
    print(instance)
    if (instance) {
        print("✔️ OS: " + instance.os);
        print("✔️ JVM: " + instance.jvm);
    }

//    var nostr = plugin("org.nostr.sdk.JVMPlatform");
//    print(nostr)
//    if (nostr) {
//        print("✔️ Platform: " + nostr.JVMPlatform().name);
//    }
}
