
import prisma from '@/lib/prisma';

export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN';

/**
 * Updates inventory quantity and logs the movement in a single transaction.
 * 
 * @param productId - The ID of the product
 * @param branchId - The ID of the branch
 * @param quantityChange - The amount to change (positive for increase, negative for decrease)
 * @param type - The type of movement
 * @param userId - The user performing the action
 * @param referenceId - Optional ID of the related record (Sale ID, Purchase ID, etc.)
 */

/**
 * Core logic for updating inventory and logging movement.
 * Can be used within an existing transaction.
 */
export async function processStockMovement(
    tx: any,
    productId: number,
    branchId: number,
    quantityChange: number,
    type: StockMovementType,
    userId: number,
    referenceId?: number
) {
    // 1. Get current inventory
    let inventory = await tx.inventory.findUnique({
        where: {
            product_id_branch_id: {
                product_id: productId,
                branch_id: branchId
            }
        }
    });

    // If inventory record doesn't exist, create it (assuming 0 quantity start)
    if (!inventory) {
        if (quantityChange < 0) {
            throw new Error(`Insufficient stock: Product ${productId} not found in branch ${branchId}`);
        }
        inventory = await tx.inventory.create({
            data: {
                product_id: productId,
                branch_id: branchId,
                quantity: 0
            }
        });
    }

    // 2. Validate sufficient stock for deduction
    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
        throw new Error(`Insufficient stock for Product ${productId} at Branch ${branchId}. Current: ${inventory.quantity}, Requested: ${Math.abs(quantityChange)}`);
    }

    // 3. Update Inventory
    const updatedInventory = await tx.inventory.update({
        where: {
            product_id_branch_id: {
                product_id: productId,
                branch_id: branchId
            }
        },
        data: {
            quantity: newQuantity
        }
    });

    // 4. Log Stock Movement
    await tx.stockMovement.create({
        data: {
            product_id: productId,
            branch_id: branchId,
            type: type,
            quantity: quantityChange,
            reference_id: referenceId,
            user_id: userId,
            date: new Date()
        }
    });

    // 5. Check for Low Stock (Logic for Alerts)
    if (updatedInventory.quantity <= updatedInventory.reorder_level) {
        console.warn(`LOW STOCK ALERT: Product ${productId} at Branch ${branchId} is at ${updatedInventory.quantity}`);
    }

    return updatedInventory;
}

/**
 * Updates inventory quantity and logs the movement in a single transaction.
 */
export async function updateInventory(
    productId: number,
    branchId: number,
    quantityChange: number,
    type: StockMovementType,
    userId: number,
    referenceId?: number
) {
    return await prisma.$transaction(async (tx) => {
        return processStockMovement(tx, productId, branchId, quantityChange, type, userId, referenceId);
    });
}

