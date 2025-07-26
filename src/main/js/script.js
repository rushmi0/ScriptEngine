var File = Java.type("java.io.File");
var URLClassLoader = Java.type("java.net.URLClassLoader");
var Thread = Java.type("java.lang.Thread");
var Class = Java.type("java.lang.Class");

var loadedClassLoader = null;

function loadJar(path) {
    var file = new File(path);
    if (!file.exists()) {
        print("❌ JAR not found: " + path);
        return false;
    }

    try {
        var url = file.toURI().toURL();
        loadedClassLoader = new URLClassLoader([url], Thread.currentThread().getContextClassLoader());
        Thread.currentThread().setContextClassLoader(loadedClassLoader);
        print("✔️ Loaded: " + url);
        return true;
    } catch (e) {
        print("❌ Load failed: " + e.message);
        return false;
    }
}

function plugin(className) {
    if (!loadedClassLoader) {
        print("❌ JAR not loaded.");
        return null;
    }

    try {
        var cls = Class.forName(className, true, loadedClassLoader);
        return cls.getDeclaredConstructor().newInstance();
    } catch (e) {
        print("❌ Instance error: " + e.message);
        return null;
    }
}

// === Example usage ===
var jar = "/home/rushmi0/items/dev/kotlin/JVM/ScriptEngine/src/main/resources/library-1.0-SNAPSHOT.jar"
//var jar = "C:/Users/bb25004/items/dev/Kotlin/JVM/kotlin-jvm-lib/library/build/libs/library-1.0-SNAPSHOT.jar"
if (loadJar(jar)) {
    var instance = plugin("org.example.core.PlatformInfo");
    if (instance) {
        print("✔️ OS: " + instance.os);
        print("✔️ JVM: " + instance.jvm);
    }
}
