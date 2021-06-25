SELECT
    dbo.SaleItem.SaleItemID,
    dbo.SaleItem.ItemIndex,
    dbo.SaleItem.ItemName,
    dbo.SaleItem.ReceiptDescription,
    dbo.SaleItem.Department,
    dbo.SaleItem.ActualPrice,
    dbo.SaleItem.BasePrice,
    (
    CASE WHEN dbo.SaleItem.Flags = 4 THEN
        1
    ELSE
        0
    END) AS IsSeat,
    (
    CASE WHEN dbo.SaleItem.IsModifier = 1 THEN
        1
    WHEN dbo.SaleItem.ModifierParent != 0 THEN
        1
    ELSE
        0
    END) AS IsModifier
FROM
    dbo.SaleItem
    LEFT JOIN dbo.Sale ON dbo.SaleItem.SaleID = dbo.Sale.SaleID
WHERE
    dbo.Sale.SaleID = :saleID
ORDER BY
    dbo.SaleItem.ItemIndex;