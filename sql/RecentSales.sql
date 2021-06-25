SELECT
    SaleID,
    CheckNumber,
    TicketNumber,
    CheckDescription,
    EndDate,
	CustomerEntered,
	LastName,
	FirstName,
	Phone,
	Total,
	dbo.OrderType.Description as OrderType
FROM
    dbo.Sale
	LEFT JOIN dbo.Customer
	ON dbo.Sale.CustomerNumber = dbo.Customer.CustomerNumber
	LEFT JOIN dbo.OrderType
	ON dbo.Sale.OrderType - 1 = dbo.OrderType.[Index]
WHERE
    dbo.Sale.IsCancelled = 0 AND
    dbo.Sale.IsTrainMode = 0 AND
    dbo.Sale.WasRefunded = 0 AND
    dbo.Sale.EndDate > :endDate
ORDER BY
    dbo.Sale.TicketNumber DESC;