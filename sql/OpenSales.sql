SELECT
	dbo.Sale.OrderType,
	dbo.OrderType.Description as OrderTypeDescription,
	COUNT(dbo.Sale.SaleID) AS SaleCount,
	SUM(dbo.Sale.SubTotal) AS SubTotal,
	SUM(dbo.Sale.Total) AS Total,
	SUM(dbo.Sale.CustomerCount) AS CustomerCount
FROM
	dbo.Sale
	LEFT JOIN dbo.OrderType
	ON dbo.Sale.OrderType - 1 = dbo.OrderType.[Index]
WHERE
	dbo.Sale.IsCancelled = 0 AND
    dbo.Sale.IsTrainMode = 0 AND
    dbo.Sale.WasRefunded = 0 AND
	EndDate IS NULL
GROUP BY dbo.Sale.OrderType, dbo.OrderType.Description
ORDER BY dbo.Sale.OrderType;