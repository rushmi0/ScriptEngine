package org.example

import java.io.File
import java.io.FileReader
import javax.script.ScriptEngineManager
import javax.script.ScriptException

fun main() {
    val engine = ScriptEngineManager().getEngineByName("nashorn")

    val jsDir = File("src/main/js")

    if (!jsDir.exists() || !jsDir.isDirectory) {
        println("❌ JS directory not found or not a directory: ${jsDir.absolutePath}")
        return
    }

    val jsFiles = jsDir.listFiles { file -> file.isFile && file.extension == "js" } ?: emptyArray()

    if (jsFiles.isEmpty()) {
        println("⚠️ No .js files found in: ${jsDir.absolutePath}")
        return
    }

    jsFiles.forEach { jsFile ->
        println("▶️ Running script: ${jsFile.name}")
        try {
            FileReader(jsFile).use { reader ->
                engine.eval(reader)
            }
        } catch (e: ScriptException) {
            println("❌ Script error in file ${jsFile.name}: $e")
            e.printStackTrace()
        } catch (e: Exception) {
            println("❌ General error in file ${jsFile.name}:")
            e.printStackTrace()
        }
    }
}
