var Plugins = (function () {
    var File = Java.type("java.io.File");
    var URLClassLoader = Java.type("java.net.URLClassLoader");
    var Thread = Java.type("java.lang.Thread");
    var Class = Java.type("java.lang.Class");

    var loader = null;

    function load(dir) {
        var folder = new File(dir);
        if (!folder.exists() || !folder.isDirectory()) {
            print("❌ Not found: " + dir);
            return false;
        }

        var FileFilter = Java.type("java.io.FileFilter");
        var jars = folder.listFiles(new (Java.extend(FileFilter))({
            accept: function (f) {
                return f.getName().toLowerCase().endsWith(".jar");
            }
        }));

        if (!jars || jars.length === 0) {
            print("⚠️ No JARs in: " + dir);
            return false;
        }

        try {
            var urls = [];
            for each (var jar in jars) {
                urls.push(jar.toURI().toURL());
                print("✔️ JAR: " + jar.getName());
            }

            loader = new URLClassLoader(urls, Thread.currentThread().getContextClassLoader());
            Thread.currentThread().setContextClassLoader(loader);

            print("✅ Loaded " + urls.length + " JAR(s)");
            return true;
        } catch (e) {
            print("❌ Load failed: " + e.message);
            return false;
        }
    }

    function use(target) {
        if (!loader) {
            print("❌ Loader not initialized.");
            return null;
        }

        try {
            if (target.indexOf("::") !== -1) {
                var parts = target.split("::");
                var clsName = parts[0];
                var method = parts[1];

                var cls = Class.forName(clsName, true, loader);

                try {
                    var companion = cls.getField("Companion").get(null);
                    return companion.getClass().getMethod(method).invoke(companion);
                } catch (e1) {
                    try {
                        return cls.getMethod(method).invoke(null);
                    } catch (e2) {
                        print("❌ Method not found: " + target);
                        return null;
                    }
                }

            } else {
                var cls = Class.forName(target, true, loader);
                return cls.getDeclaredConstructor().newInstance();
            }
        } catch (e) {
            print("❌ Error calling: " + target);
            print("   " + e.message);
            return null;
        }
    }

    return {
        load: load,
        use: use
    };
})();



var path = "/home/rushmi0/items/dev/kotlin/JVM/ScriptEngine/src/main/resources";

if (Plugins.load(path)) {
    var info = Plugins.use("org.example.core.PlatformInfo");
    if (info) {
        print("✔️ OS: " + info.os);
        print("✔️ JVM: " + info.jvm);
    }

    var keys = Plugins.use("rust.nostr.sdk.Keys::generate");
    if (keys) {
        var sk = keys.secretKey();
        var pk = keys.publicKey();

        print("Private Key: " + sk.toHex());
        print("Public Key: " + pk.toHex());
        print("NSEC: " + sk.toBech32());
        print("NPUB: " + pk.toBech32());
    }
}
