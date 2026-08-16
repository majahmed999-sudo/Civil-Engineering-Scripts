import { Router, type IRouter, type Request, type Response } from "express";
import path from "node:path";
import fs from "node:fs";

const router: IRouter = Router();

const apkPath = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "concrete-calc.apk",
);

router.get("/download-apk", (_req: Request, res: Response) => {
  if (!fs.existsSync(apkPath)) {
    res.status(404).json({ error: "APK file not found" });
    return;
  }

  const stat = fs.statSync(apkPath);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="concrete-calc.apk"`,
  );
  res.sendFile(apkPath);
});

export default router;
