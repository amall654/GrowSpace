param([string]$SrsInput = 'C:/Users/HP/Documents/project/output/documents/GrowSpace_SRS_AR.docx', [string]$SrsPdf = 'C:/Users/HP/Documents/project/output/documents/GrowSpace_SRS_AR.pdf')
$ErrorActionPreference = 'Stop'
$srsWord = New-Object -ComObject Word.Application
$srsWord.Visible = $false
$srsWord.DisplayAlerts = 0
try {
    $srsDocument = $srsWord.Documents.Open($SrsInput, $false, $false)
    $srsDocument.Fields.Update() | Out-Null
    foreach ($srsToc in $srsDocument.TablesOfContents) { $srsToc.Update() }
    $srsDocument.Repaginate()
    foreach ($srsToc in $srsDocument.TablesOfContents) { $srsToc.UpdatePageNumbers() }
    foreach ($srsToc in $srsDocument.TablesOfContents) {
        $srsToc.Range.Select()
        $srsWord.Selection.RtlPara()
        $srsToc.Range.Font.NameBi = 'Arial'
    }
    $srsDocument.Save()
    $srsExportTemp = Join-Path (Split-Path $SrsPdf -Parent) ('render-' + [guid]::NewGuid().ToString() + '.pdf')
    $srsDocument.ExportAsFixedFormat($srsExportTemp, 17)
    Copy-Item -LiteralPath $srsExportTemp -Destination $SrsPdf -Force
    Remove-Item -LiteralPath $srsExportTemp
    Write-Output ('Pages: ' + $srsDocument.ComputeStatistics(2))
    $srsDocument.Close(0)
} finally {
    $srsWord.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($srsWord) | Out-Null
}
