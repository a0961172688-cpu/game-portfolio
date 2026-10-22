using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class UnityPortfolioWebBuild
{
    public static void Build()
    {
        try
        {
            string[] args = Environment.GetCommandLineArgs();
            int outputArg = Array.IndexOf(args, "-portfolioOutput");
            if (outputArg < 0 || outputArg + 1 >= args.Length) throw new ArgumentException("Missing -portfolioOutput");
            string output = Path.GetFullPath(args[outputArg + 1]);
            Directory.CreateDirectory(output);
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.WebGL, ScriptingImplementation.IL2CPP);
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
            PlayerSettings.WebGL.decompressionFallback = false;
            PlayerSettings.WebGL.dataCaching = false;
            PlayerSettings.WebGL.nameFilesAsHashes = false;
            PlayerSettings.runInBackground = true;
            bool portrait = PlayerSettings.productName.IndexOf("panda", StringComparison.OrdinalIgnoreCase) >= 0;
            PlayerSettings.defaultWebScreenWidth = portrait ? 480 : 1280;
            PlayerSettings.defaultWebScreenHeight = portrait ? 850 : 720;
            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = EditorBuildSettings.scenes.Where(scene => scene.enabled).Select(scene => scene.path).ToArray(),
                locationPathName = output,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            });
            string result = "{\"result\":\"" + report.summary.result + "\",\"errors\":" + report.summary.totalErrors + ",\"bytes\":" + report.summary.totalSize + "}";
            File.WriteAllText(Path.Combine(output, "build-result.json"), result);
            Debug.Log("PORTFOLIO_WEB_BUILD " + result);
            EditorApplication.Exit(report.summary.result == BuildResult.Succeeded ? 0 : 1);
        }
        catch (Exception exception)
        {
            Debug.LogException(exception);
            EditorApplication.Exit(1);
        }
    }
}
