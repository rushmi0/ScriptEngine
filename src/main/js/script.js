var File = Java.type("java.io.File");
var URLClassLoader = Java.type("java.net.URLClassLoader");
var Thread = Java.type("java.lang.Thread");
var Class = Java.type("java.lang.Class");

var loadedClassLoader = null;


function classLoader(jarPath) {
    try {
        var jarFile = new File(jarPath);
        if (!jarFile.exists()) {
            throw new Error("❌ JAR file not found: " + jarPath);
        }

        var jarURL = jarFile.toURI().toURL();
        var currentClassLoader = Thread.currentThread().getContextClassLoader();
        loadedClassLoader = new URLClassLoader([jarURL], currentClassLoader);
        Thread.currentThread().setContextClassLoader(loadedClassLoader);

        print("✔️ Loaded JAR from: " + jarURL);
        return true;
    } catch (e) {
        print("❌ Failed to load JAR: " + e);
        return false;
    }
}

var jarPath = "/home/rushmi0/items/dev/kotlin/JVM/EngineScript/src/main/resources/library-1.0-SNAPSHOT.jar";
classLoader(jarPath)


var Class = Java.type("java.lang.Class");

function plugin(className) {
    try {
        var clazz = Class.forName(className, true, loadedClassLoader);
        var instance = clazz.getDeclaredConstructor().newInstance();
        return instance;
    } catch (e) {
        print("❌ Failed to create instance: " + e);
        return null;
    }
}

var platform = plugin('org.example.core.JVMPlatform');
if (platform !== null) {
    print("✔️ Instance created: " + platform.version);
}
