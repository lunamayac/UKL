import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

// Create new request
export const userCreateRequest = async (req: Request, res: Response) => {
    try {
      const { userId, itemId, borrowDate, returnDate } = req.body;
  
      const request = await prisma.request.create({
        data: {
          userId,
          itemId, 
          borrowDate: new Date(borrowDate),
          returnDate: new Date(returnDate),
        }
      });
      
  
      res.status(201).json({
        success: true,
        message: "Peminjaman berhasil dicatat",
        data: {
          borrowId: request.borrowId,
          itemId: request.itemId.toString(),
          userId: request.userId.toString(),
          borrowDate: request.borrowDate.toISOString().split('T')[0],
          returnDate: request.returnDate.toISOString().split('T')[0]
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create request",
        error
      });
    }
  };
  
  // Get all requests
  export const userGetAllRequest = async (req: Request, res: Response) => {
    try {
      const requests = await prisma.request.findMany({
        include: {
          user: true,
          item: true
        }
      });
  
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get requests",
        error
      });
    }
  };
  
  // Update return date for borrowed item
  export const updateReturnDate = async (req: Request, res: Response) => {
    try {
      const { borrowId, returnDate } = req.body;

      const request = await prisma.request.update({
        where: {
          borrowId: parseInt(borrowId)
        },
        data: {
          returnDate: new Date(returnDate)
        },
        include: {
          user: true,
          item: true
        }
      });

      res.status(200).json({
        status: "success", 
        message: "pengembalian barang berhasil dicatat",
        data: {
          borrowId: request.borrowId,
          itemId: request.itemId.toString(),
          userId: request.userId.toString(),
          actual_return_date: request.returnDate.toISOString().split('T')[0]
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to update return date",
        error
      });
    }
  };
  
  // Delete request
  export const userDeleteRequest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      await prisma.request.delete({
        where: {
          borrowId: parseInt(id)
        }
      });
  
      res.status(200).json({
        success: true,
        message: "Request deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete request",
        error
      });
    }
  };
  
  // Get user requests
  export const getUserRequests = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
  
      const requests = await prisma.request.findMany({
        where: {
          userId: parseInt(userId)
        },
        include: {
          item: true
        }
      });
  
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get user requests",
        error
      });
    }
  };
  
  export const analyzeUsage = async (req: Request, res: Response): Promise<any> => {
    try {
        const { start_date, end_date, group_by } = req.body

        if (!start_date || !end_date || !group_by) {
            return res.status(400).json({
                status: "error",
                message: "startDate, endDate, and group_by are required"
            })
        }

        // Validasi group_by
        if (!['category', 'location'].includes(group_by)) {
            return res.status(400).json({
                status: "error",
                message: "group_by must be either 'category' or 'location'"
            })
        }

        // Query untuk mendapatkan data analisis
        const usageData = await prisma.item.findMany({
            where: {
                requests: {
                    some: {
                        borrowDate: {
                            gte: new Date(start_date),
                            lte: new Date(end_date)
                        }
                    }
                }
            },
            select: {
                [group_by]: true,
                requests: {
                    where: {
                        borrowDate: {
                            gte: new Date(start_date),
                            lte: new Date(end_date)
                        }
                    },
                    select: {
                        borrowId: true,
                        actualReturnDate: true
                    }
                }
            }
        })

        // Proses data untuk format yang diinginkan
        const groupedData = usageData.reduce((acc, item) => {
            const group = item[group_by] as string
            
            if (!acc[group]) {
                acc[group] = {
                    totalBorrowed: 0,
                    totalReturned: 0,
                    itemsInUse: 0
                }
            }

            const requests = item.requests
            acc[group].totalBorrowed += requests.length
            acc[group].totalReturned += requests.filter(r => r.actualReturnDate).length
            acc[group].itemsInUse = acc[group].totalBorrowed - acc[group].totalReturned

            return acc
        }, {} as Record<string, { totalBorrowed: number; totalReturned: number; itemsInUse: number }>)

        // Format hasil akhir
        const usageAnalysis = Object.entries(groupedData).map(([group, stats]) => ({
            group,
            ...stats
        }))

        res.status(200).json({
            status: "Success",
            data: {
                analysis_period: {
                    start_date,
                    end_date
                },
                usageAnalysis
            }
        })
    } catch (error) {
        console.error('Analysis error:', error)
        res.status(500).json({
            status: "error",
            message: "Failed to analyze usage",
            error
        })
    }
}

export const analyzeItemEfficiency = async (req: Request, res: Response): Promise<any> => {
    try {
        const { start_date, end_date } = req.body

        // Validasi input
        if (!start_date || !end_date) {
            return res.status(400).json({
                status: "error",
                message: "startDate and endDate are required"
            })
        }

        // Convert string dates to Date objects
        const start = new Date(start_date)
        const end = new Date(end_date)

        // 1. Analisis barang yang sering dipinjam
        const frequentlyBorrowedItems = await prisma.item.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                _count: {
                    select: {
                        requests: {
                            where: {
                                borrowDate: {
                                    gte: start,
                                    lte: end
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                requests: {
                    _count: 'desc'
                }
            },
            take: 10 // Ambil 10 item teratas
        })

        // 2. Analisis barang yang tidak efisien (sering terlambat dikembalikan)
        const inefficientItems = await prisma.item.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                requests: {
                    where: {
                        borrowDate: {
                            gte: start,
                            lte: end
                        }
                    },
                    select: {
                        returnDate: true,
                        actualReturnDate: true
                    }
                }
            }
        })

        // Proses data untuk format response
        const frequentlyBorrowedFormatted = frequentlyBorrowedItems.map(item => ({
            itemId: item.id,
            name: item.name,
            category: item.category,
            totalBorrowed: item._count.requests
        }))

        const inefficientItemsFormatted = inefficientItems.map(item => {
            const totalBorrowed = item.requests.length
            const totalLateReturns = item.requests.filter(req => {
                if (!req.actualReturnDate) return false
                return new Date(req.actualReturnDate) > new Date(req.returnDate)
            }).length

            return {
                itemId: item.id,
                name: item.name,
                category: item.category,
                totalBorrowed,
                totalLateReturns
            }
        }).filter(item => item.totalLateReturns > 0) // Hanya tampilkan item yang pernah terlambat
        .sort((a, b) => b.totalLateReturns - a.totalLateReturns) // Urutkan berdasarkan keterlambatan
        .slice(0, 10) // Ambil 10 item teratas

        res.status(200).json({
            status: "Success",
            data: {
                analysis_period: {
                    start_date,
                    end_date
                },
                frequently_borrowed_items: frequentlyBorrowedFormatted,
                inefficient_items: inefficientItemsFormatted
            }
        })

    } catch (error) {
        console.error('Analysis error:', error)
        res.status(500).json({
            status: "error",
            message: "Failed to analyze item efficiency",
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        })
    }
}