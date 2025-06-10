import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useStorePage } from "@/hooks/useStorePage";
import { exportPDF } from "@/utils/exportMenu";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ExportMenu() {
  const { isLoading: isFetching, storeId, categorizedMenu } = useStorePage();
  const { storeData } = useStoreInfo(storeId);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!storeData?.store) return;
    setIsExporting(true);
    try {
      await exportPDF(categorizedMenu, storeData?.store);
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      disabled={isFetching || isExporting}
      className="w-full sm:w-auto"
    >
      {isExporting ? (
        <>
          <Loader2 className="animate-spin w-4 h-4" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export Menu
        </>
      )}
    </Button>
  );
}
