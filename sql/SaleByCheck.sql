SELECT
    SaleID,
    CheckNumber,
    TicketNumber,
    CheckDescription,
    SubTotal,
    Total,
    dbo.Sale.CustomerNumber,
    LastName,
    FirstName,
    Phone,
    dbo.OrderType.Description as OrderType
FROM
    dbo.Sale
    LEFT JOIN dbo.Customer
    ON dbo.Sale.CustomerNumber = dbo.Customer.CustomerNumber
    LEFT JOIN dbo.OrderType
    ON dbo.Sale.OrderType - 1 = dbo.OrderType.[Index] 
WHERE
    dbo.Sale.CheckNumber = :checkNumber
    AND dbo.Sale.EndDate IS NOT NULL
    AND dbo.Sale.IsCancelled = 0
    AND dbo.Sale.ReOpenCheckNumber = 0
    AND dbo.Sale.IsTrainMode = 0;