var File = Java.type("java.io.File");
var URLClassLoader = Java.type("java.net.URLClassLoader");
var Thread = Java.type("java.lang.Thread");
var Class = Java.type("java.lang.Class");
var Paths = Java.type("java.nio.file.Paths");
var Files = Java.type("java.nio.file.Files");
var URL = Java.type("java.net.URL");

var Plugins = (function () {

    var loader = null;
    var repositories = [];

    function addRepository(url) {
        if (repositories.indexOf(url) === -1) {
            repositories.push(url);
        }
    }

    function dependsOn(coord, saveDirPath) {
        var parts = coord.split(":");
        if (parts.length !== 3) {
            print("❌ Invalid coordinate: " + coord);
            return false;
        }

        var group = parts[0];
        var artifact = parts[1];
        var version = parts[2];

        var groupPath = group.replace(/\./g, "/");
        var jarName = artifact + "-" + version + ".jar";

        var saveDir = new File(saveDirPath);
        if (!saveDir.exists()) {
            saveDir.mkdirs();
        }

        var destPath = Paths.get(saveDir.getAbsolutePath(), jarName);
        if (Files.exists(destPath)) {
            print("📦 Already downloaded: " + jarName);
            return true;
        }

        for each (var repo in repositories) {
            var url = repo + "/" + groupPath + "/" + artifact + "/" + version + "/" + jarName;

            try {
                print("⬇️  Trying: " + url);
                var input = new URL(url).openStream();
                Files.copy(input, destPath);
                input.close();
                print("✅ Saved to: " + destPath.toString());
                return true;
            } catch (e) {
                print("⚠️  Failed from: " + repo);
            }
        }

        print("❌ All repositories failed for: " + coord);
        return false;
    }

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
            var cls = Class.forName(target, true, loader);

            try {
                // ถ้ามี Companion object
                return cls.getField("Companion").get(null);
            } catch (e) {
                // ถ้าไม่มี Companion ให้สร้าง instance ปกติ
                return cls.getDeclaredConstructor().newInstance();
            }

        } catch (e) {
            print("❌ Error loading class: " + target);
            print("   " + e.message);
            return null;
        }
    }



    return {
        addRepository: addRepository,
        dependsOn: dependsOn,
        load: load,
        use: use,
    };

})();


var path = "/home/rushmi0/items/dev/kotlin/JVM/ScriptEngine/src/main/resources";

Plugins.addRepository("https://repo1.maven.org/maven2");

Plugins.dependsOn("net.java.dev.jna:jna:5.17.0", path);
Plugins.dependsOn("org.rust-nostr:nostr-sdk-jvm:0.42.1", path);

if (Plugins.load(path)) {
    var info = Plugins.use("org.example.core.PlatformInfo");
    if (info) {
        print("✔️ OS: " + info.os);
        print("✔️ JVM: " + info.jvm);
    }

    var Keys = Plugins.use("rust.nostr.sdk.Keys");
    if (Keys) {
        var newKey = Keys.generate();
        var sk = newKey.secretKey();
        var pk = newKey.publicKey();

        var skHex = sk.toHex();
        var pkHex = pk.toHex();

        var nsec = sk.toBech32();
        var npub = pk.toBech32();

        print("Private Key: " + skHex);
        print("Public Key: " + pkHex);
        print("NSEC: " + nsec);
        print("NPUB: " + npub);

        print();
        var skeys = Keys.parse(nsec)
        print(skeys.secretKey().toHex());
        print(skeys.publicKey().toHex());

        var SecretKey = Plugins.use("rust.nostr.sdk.SecretKey");
        var secretKey = SecretKey.parse(skHex);
        print(secretKey.toBech32());

    }

}




