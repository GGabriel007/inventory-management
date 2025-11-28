/*
    Fields
        name -> String, required
        sku -> String, required, unique per warehouse
        description -> String
        quantity -> Number, required
        warehouse -> ObjectId -> references Warehouse
        storageLocation -> String
        createdAt -> Date, default now 

    Edge Cases to Consider:
        Ensure quantity + warehouse.currenty <= warehouse.capacity
        Handle duplicate sku for the same warehouse

*/