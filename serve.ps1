$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8080)
$listener.Start()

Write-Host 'Pokedex PWA em http://localhost:8080/'

function Send-Response {
  param(
    [System.IO.Stream] $Stream,
    [string] $Status,
    [string] $ContentType,
    [byte[]] $Body
  )

  $header = "HTTP/1.1 $Status`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

while ($true) {
  $client = $listener.AcceptTcpClient()

  try {
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $line = $reader.ReadLine()

    if ([string]::IsNullOrWhiteSpace($line)) {
      $client.Close()
      continue
    }

    $parts = $line.Split(' ')
    $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }

    do {
      $headerLine = $reader.ReadLine()
    } while ($null -ne $headerLine -and $headerLine.Length -gt 0)

    $requestPath = $requestPath.Split('?')[0].TrimStart('/')
    $requestPath = [Uri]::UnescapeDataString($requestPath)

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = 'index.html'
    }

    $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $requestPath))

    if (-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($fullPath)) {
      Send-Response -Stream $stream -Status '404 Not Found' -ContentType 'text/plain; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes('Not found'))
      $client.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    $contentType = switch ($extension) {
      '.html' { 'text/html; charset=utf-8' }
      '.js' { 'text/javascript; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      '.webmanifest' { 'application/manifest+json; charset=utf-8' }
      '.svg' { 'image/svg+xml' }
      '.png' { 'image/png' }
      default { 'application/octet-stream' }
    }

    Send-Response -Stream $stream -Status '200 OK' -ContentType $contentType -Body ([System.IO.File]::ReadAllBytes($fullPath))
  } catch {
    try {
      Send-Response -Stream $stream -Status '500 Internal Server Error' -ContentType 'text/plain; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message))
    } catch {
    }
  } finally {
    $client.Close()
  }
}
