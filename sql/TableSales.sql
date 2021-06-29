SELECT
	dbo.LayoutTable.LayoutTableID,
	dbo.LayoutTable.TableName,
	dbo.LayoutTable.TableIndex,
	dbo.LayoutTable.ShapeType,
	dbo.LayoutTable.X,
	dbo.LayoutTable.Y,
	dbo.LayoutTable.SeatCount,
	dbo.LayoutTable.JoinTableIndex,
	dbo.LayoutTable.RoomIndex,
	dbo.LayoutRoom.RoomName,
	dbo.LayoutRoom.LayoutRoomID,
	Sale.SaleID,
	Sale.CheckNumber,
	Sale.CheckDescription,
	Sale.CustomerCount,
	Sale.EmployeeName,
	DATEDIFF(MINUTE, Sale.StartDate, GETDATE ()) AS Age
FROM
	dbo.LayoutTable
	LEFT JOIN dbo.LayoutRoom ON dbo.LayoutTable.RoomIndex = dbo.LayoutRoom.RoomIndex
	LEFT JOIN (
		SELECT
			*
		FROM
			dbo.Sale
		WHERE
			dbo.Sale.IsCancelled = 0
			AND dbo.Sale.IsTrainMode = 0
			AND dbo.Sale.WasRefunded = 0
			AND dbo.Sale.EndDate IS NULL) Sale ON dbo.LayoutTable.TableIndex = Sale.TableIndex - 1
ORDER BY
	dbo.LayoutTable.RoomIndex,
	Age,
	dbo.LayoutTable.TableName,
	dbo.LayoutTable.TableIndex;