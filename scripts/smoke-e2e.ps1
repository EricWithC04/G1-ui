# Smoke E2E NovaTech - rutas criticas front + APIs via proxy dev
$ErrorActionPreference = 'Continue'
$base = 'http://localhost:4200'
$api = 'http://localhost:8080'
$fail = @()
$pass = @()
$warn = @()

function Test-HtmlRoute([string]$path, [string]$label) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -TimeoutSec 15
        $html = $r.Content
        if ($r.StatusCode -ne 200) { $script:fail += "${label}: HTTP $($r.StatusCode)"; return }
        if ($html -match '"status"\s*:\s*500|"Internal Server Error"') {
            $script:fail += "${label}: JSON 500 en lugar de SPA"
            return
        }
        if ($html -notmatch 'app-root') {
            $script:fail += "${label}: sin app-root"
            return
        }
        $script:pass += "${label}: OK"
    } catch {
        $script:fail += "${label}: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "=== SMOKE E2E NovaTech ===" -ForegroundColor Cyan

@(
    @('/', 'Tienda /'),
    @('/login', 'Login'),
    @('/admin', 'Admin dashboard'),
    @('/admin/crm/clientes', 'CRM clientes'),
    @('/admin/crm/inbox', 'CRM inbox'),
    @('/admin/productos', 'Productos'),
    @('/admin/pedidos', 'Pedidos'),
    @('/admin/pagos', 'Pagos'),
    @('/admin/envios', 'Envios'),
    @('/admin/creditos', 'Creditos'),
    @('/admin/facturacion', 'Facturacion'),
    @('/admin/configuracion', 'Config hub'),
    @('/admin/configuracion/usuarios', 'Config usuarios'),
    @('/admin/planes', 'Planes cuotas'),
    @('/admin/pos', 'POS mostrador')
) | ForEach-Object { Test-HtmlRoute $_[0] $_[1] }

function Test-ApiGet([string]$path, [int[]]$okStatuses, [string]$label, $session = $null) {
    try {
        $params = @{ Uri = "$base$path"; UseBasicParsing = $true; TimeoutSec = 15 }
        if ($session) { $params.WebSession = $session }
        $r = Invoke-WebRequest @params
        if ($okStatuses -contains $r.StatusCode) { $script:pass += "${label}: $($r.StatusCode)" }
        else { $script:fail += "${label}: HTTP $($r.StatusCode)" }
    } catch {
        $code = $null
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        if ($code -and ($okStatuses -contains $code)) { $script:pass += "${label}: $code" }
        else { $script:fail += "${label}: HTTP $code" }
    }
}

Test-ApiGet '/productos' @(200) 'API GET /productos'
Test-ApiGet '/categorias' @(200) 'API GET /categorias'
Test-ApiGet '/auth/me' @(401) 'API GET /auth/me sin sesion'

$loginBody = '{"email":"superadmin@novatech.com","contrasena":"admin123"}'
$session = $null
try {
    $lr = Invoke-WebRequest -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing -SessionVariable session -TimeoutSec 15
    if ($lr.StatusCode -eq 200) { $pass += 'Login superadmin: 200' } else { $fail += "Login superadmin: $($lr.StatusCode)" }
} catch {
    $fail += "Login superadmin: $($_.Exception.Message)"
}

if ($session) {
    Test-ApiGet '/auth/me' @(200) 'API GET /auth/me con sesion' $session
    foreach ($pair in @(
        @('/cuotas', 'API GET /cuotas'),
        @('/perfiles', 'API GET /perfiles'),
        @('/pedidos', 'API GET /pedidos'),
        @('/admin/notificaciones', 'API GET /admin/notificaciones'),
        @('/configuracion/rbac/matriz', 'API GET /rbac matriz'),
        @('/dashboard/kpis', 'API GET /dashboard/kpis')
    )) {
        try {
            $r = Invoke-WebRequest -Uri "$base$($pair[0])" -WebSession $session -UseBasicParsing -TimeoutSec 15
            if ($r.StatusCode -eq 200) {
                if ($r.Content -match '<!doctype|<html') {
                    $fail += "$($pair[1]): HTML en lugar de JSON"
                } elseif ($r.Content -match '^\s*[\[\{]') {
                    $pass += "$($pair[1]): 200 JSON"
                } else {
                    $warn += "$($pair[1]): 200 respuesta inesperada"
                }
            } else {
                $fail += "$($pair[1]): $($r.StatusCode)"
            }
        } catch {
            $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'err' }
            $fail += "$($pair[1]): $code"
        }
    }
    try {
        $cr = Invoke-WebRequest -Uri "$base/cuotas" -WebSession $session -UseBasicParsing -TimeoutSec 15
        $null = $cr.Content | ConvertFrom-Json
        $pass += 'API /cuotas JSON parseable: OK'
    } catch {
        $fail += "API /cuotas JSON invalido: $($_.Exception.Message)"
    }
}

try {
    $hr = Invoke-WebRequest -Uri "$api/actuator/health" -UseBasicParsing -TimeoutSec 10
    if ($hr.StatusCode -eq 200) { $pass += 'Backend actuator/health: 200' } else { $fail += "Backend health: $($hr.StatusCode)" }
} catch {
    $fail += "Backend health: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "--- PASS ($($pass.Count)) ---" -ForegroundColor Green
$pass | ForEach-Object { Write-Host "  [OK] $_" }

if ($warn.Count) {
    Write-Host ""
    Write-Host "--- WARN ($($warn.Count)) ---" -ForegroundColor Yellow
    $warn | ForEach-Object { Write-Host "  [!!] $_" }
}

Write-Host ""
Write-Host "--- FAIL ($($fail.Count)) ---" -ForegroundColor $(if ($fail.Count) { 'Red' } else { 'Green' })
if ($fail.Count) { $fail | ForEach-Object { Write-Host "  [XX] $_" } } else { Write-Host '  (ninguno)' }

Write-Host ""
exit $(if ($fail.Count) { 1 } else { 0 })
