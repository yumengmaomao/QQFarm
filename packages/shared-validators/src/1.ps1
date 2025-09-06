# simple_loadtest.ps1

# 将 YOUR_ACCESS_TOKEN 替换为你在第一步中获取的实际值
$accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwLCJlbWFpbCI6ImFkbWluQHFxLmNvbSIsImlhdCI6MTc1NjcxMjIzOSwiZXhwIjoxNzU2NzE1ODM5fQ.5FEEdn-pnu7ANTP94d122Nfu-Bz29lqiVVDB-B2bwCI"

# 设置要发送的请求总次数
$numRequests = 100

# 定义请求的 URL 和 headers
$uri = "http://127.0.0.1:3000/api/shop/listings"
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

Write-Host "开始对 $uri 进行 $numRequests 次压测..."

# 记录开始时间
$startTime = Get-Date

# 循环发送请求
for ($i = 1; $i -le $numRequests; $i++) {
    Write-Host "正在发送请求: $i/$numRequests"
    # 使用 -OutFile $null 来丢弃响应内容，避免屏幕输出过多
    # -ErrorAction SilentlyContinue 忽略请求失败的错误，让脚本继续运行
      Invoke-WebRequest -Uri $uri -Headers $headers -Method Get -ErrorAction SilentlyContinue | Out-Null
}

# 记录结束时间
$endTime = Get-Date

# 计算总耗时
$totalTime = New-TimeSpan -Start $startTime -End $endTime

Write-Host "压测完成！"
Write-Host "总耗时：$($totalTime.TotalSeconds) 秒"