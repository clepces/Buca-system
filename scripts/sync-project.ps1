<#
.SYNOPSIS
    BUCA SYNC MANAGER v2.8 - Dashboard con Estadísticas Avanzadas.
#>

param (
    [string]$SourcePath = "C:\wamp64\www\Applications\buca",
    [string]$DestinationPath = "C:\wamp64\www\Applications\buca-ai\buca",
    [int]$IntervalSeconds = 60,
    [switch]$Watch
)

# Variables de Sesion Globales
$Global:SessionUpdates = 0
$Global:SessionDeletions = 0
$LogFile = Join-Path $SourcePath "sync-history.log"
$ExcludeDirs = @("node_modules")

# Configuracion de Entorno
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-Separator($Color = "Cyan") {
    Write-Host ("=" * 60) -ForegroundColor $Color
}

function Invoke-Sync {
    param([bool]$IsWatch)

    $StartTime = Get-Date
    Write-Host "`n[$($StartTime.ToString('HH:mm:ss'))] Analizando cambios..." -ForegroundColor Gray
    
    $robocopyParams = @(
        $SourcePath,
        $DestinationPath,
        "/MIR",
        "/XD", $ExcludeDirs,
        "/XF", "sync-history.log",
        "/R:2", "/W:3",
        "/MT:16",
        "/NP",
        "/NJH", "/NJS",
        "/NDL",
        "/FP",
        "/BYTES"
    )

    $output = & robocopy @robocopyParams
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime
    
    $stats = @{
        Updated = 0
        Deleted = 0
        Errors  = 0
        Bytes   = 0
    }

    foreach ($line in $output) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }

        # Deteccion de Cambios y Tamaño
        if ($line -match "New File" -or $line -match "Modified" -or $line -match "Newer" -or $line -match "Nuevo arch" -or $line -match "M.s reciente") {
            $stats.Updated++
            $Global:SessionUpdates++
            
            # Intentar extraer el tamaño en bytes (suele ser el primer numero largo)
            if ($line -match "(\d+)\s+([A-Z]:\\.*)") {
                $stats.Bytes += [long]$matches[1]
                $filePath = $matches[2]
                Write-Host "  [+] $filePath" -ForegroundColor Gray
            }
            else {
                Write-Host "  [+] Cambio detectado" -ForegroundColor Gray
            }
        }

        if ($line -match "EXTRA") {
            $stats.Deleted++
            $Global:SessionDeletions++
            if ($line -match "([A-Z]:\\.*)") {
                Write-Host "  [-] $($matches[1])" -ForegroundColor Yellow
            }
        }

        if ($line -match "ERROR") {
            $stats.Errors++
            Write-Host "  [!] $trimmed" -ForegroundColor Red
        }
    }

    # Calculos de Rendimiento
    $SizeMB = [Math]::Round($stats.Bytes / 1MB, 2)
    $Speed = if ($Duration.TotalSeconds -gt 0.1) { [Math]::Round($SizeMB / $Duration.TotalSeconds, 2) } else { 0 }
    
    # Dashboard Final
    Write-Separator "Green"
    Write-Host "  RESUMEN DE OPERACION ($($EndTime.ToString('HH:mm:ss')))" -ForegroundColor Green
    Write-Separator "Green"
    Write-Host "  Actualizados: " -NoNewline; Write-Host "$($stats.Updated)" -ForegroundColor Green -NoNewline
    Write-Host " (Global: $Global:SessionUpdates)" -ForegroundColor Gray
    
    Write-Host "  Eliminados:   " -NoNewline; Write-Host "$($stats.Deleted)" -ForegroundColor Yellow -NoNewline
    Write-Host " (Global: $Global:SessionDeletions)" -ForegroundColor Gray

    Write-Host "  Volumen:      " -NoNewline; Write-Host "$SizeMB MB" -ForegroundColor Cyan
    Write-Host "  Velocidad:    " -NoNewline; Write-Host "$Speed MB/s" -ForegroundColor Cyan
    Write-Host "  Duracion:     " -NoNewline; Write-Host "$([Math]::Round($Duration.TotalSeconds, 2)) seg" -ForegroundColor Gray
    
    Write-Host "  Errores:      " -NoNewline; Write-Host "$($stats.Errors)" -ForegroundColor Red
    Write-Host "  Estado:        " -NoNewline; 
    if ($IsWatch) {
        Write-Host "Esperando cambios..." -ForegroundColor Cyan
    }
    else {
        Write-Host "Finalizado" -ForegroundColor Gray
    }

    if ($stats.Updated -gt 0 -or $stats.Deleted -gt 0 -or $stats.Errors -gt 0) {
        $logLine = "[$($EndTime.ToString('yyyy-MM-dd HH:mm:ss'))] Vol=$SizeMB MB | Dur=$([Math]::Round($Duration.TotalSeconds, 2))s | Upd=$($stats.Updated) Del=$($stats.Deleted)"
        $logLine | Out-File -FilePath $LogFile -Append -Encoding utf8
    }
}

# --- Inicio ---
if ($Watch) {
    while ($true) {
        Clear-Host
        Write-Separator "Cyan"
        Write-Host "  BUCA SYNC MANAGER v2.8 (MODO WATCH)" -ForegroundColor Cyan
        Write-Host "  Origen:  $SourcePath"
        Write-Host "  Destino: $DestinationPath"
        Write-Separator "Cyan"
        
        Invoke-Sync -IsWatch $true
        
        for ($i = $IntervalSeconds; $i -gt 0; $i--) {
            Write-Host "`r  Siguiente verificacion en: $i s  " -NoNewline -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }
}
else {
    Write-Separator "Cyan"
    Write-Host "  BUCA SYNC MANAGER v2.8 (EJECUCION UNICA)" -ForegroundColor Cyan
    Write-Separator "Cyan"
    Invoke-Sync -IsWatch $false
}
