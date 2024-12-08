import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { string } from "joi";
import { text } from "stream/consumers";

const prisma = new PrismaClient();

export const createItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, category, location, quantity } = req.body;

        // Buat item baru
        const item = await prisma.item.create({
            data: {
                name,
                category,
                location,
                quantity: parseInt(quantity), // Pastikan tipe datanya Int
            },
        });

        const errors: Record<string, string> = {};
    if (!name || name.trim() === "") errors.name = "Name is required";
    if (!category || category.trim() === "") errors.category = "Category is required";
    if (!location || location.trim() === "") errors.location = "Location is required";

    // Jika ada error, kirimkan respons error
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors,
        });
    }

        if(quantity === 1){
          return res.status(400).json({
            success: false,
            message: `barang tidak boleh kurang dari satu`
          
          })}
       
          return res.status(200).json({
            success: true,
            message: "item deleted successfully",
            data: item
          });
    } catch (error: any) {
        console.error("Error creating item:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create item",
            error: error.message || "Unknown error", // Tampilkan detail error
        });
    }
};

// Fungsi untuk update item
export const updateItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { name, category, location, quantity } = req.body;

        // // Validasi input
        // const errors: Record<string, string> = {};
        // if (!name || name.trim() === "") errors.name = "Name is required";
        // if (!category || category.trim() === "") errors.category = "Category is required";
        // if (!location || location.trim() === "") errors.location = "Location is required";

        // // Jika ada error, kirimkan respons error
        // if (Object.keys(errors).length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Validation Error",
        //         errors: errors,
        //     });
        // }

        // Validasi quantity
        if (quantity && quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be less than 1",
            });
        }

        // Cari item berdasarkan ID
        const findItem = await prisma.item.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!findItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // Update item
        const updatedItem = await prisma.item.update({
            where: { id: parseInt(id, 10) },
            data: {
                name: name || findItem.name,
                category: category || findItem.category,
                location: location || findItem.location,
                quantity: quantity !== undefined ? parseInt(quantity.toString(), 10) : findItem.quantity,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: updatedItem,
        });

    } catch (error: any) {
        console.error("Error updating item:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update item",
            error: error.message || "Unknown error",
        });
    }
};


export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.item.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: "item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error
    });
  }
};

export const getAllItem = async (req: Request, res: Response) => {
  try {
    const facilities = await prisma.item.findMany();

    res.status(200).json({
      success: true,
      data: facilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get facilities",
      error
    });
  }
};

