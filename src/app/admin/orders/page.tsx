'use client';

import { collection, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2, MoreHorizontal } from 'lucide-react';

import { useFirestore, useCollection } from '@/firebase';
import type { Order } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function OrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const ordersCollection = firestore ? collection(firestore, 'orders') : null;
  const { data: orders, loading } = useCollection<Order>(ordersCollection);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if (!firestore || !orderId) return;
    const orderRef = doc(firestore, 'orders', orderId);

    updateDoc(orderRef, { status })
        .then(() => {
            toast({
                title: "Success",
                description: `Order status updated to ${status}.`,
            });
        })
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: orderRef.path,
                operation: 'update',
                requestResourceData: { status: status },
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBadgeVariant = (status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Processing':
        return 'default';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Orders</CardTitle>
        <CardDescription>View and manage all customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              [...orders].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.createdAt?.seconds 
                      ? format(new Date(order.createdAt.seconds * 1000), 'PPpp')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">{order.phone}</div>
                    <div className="text-sm text-muted-foreground">{order.address}</div>
                  </TableCell>
                  <TableCell>{order.productName} (x{order.quantity})</TableCell>
                  <TableCell className="text-right">৳{order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(status => (
                           <DropdownMenuItem
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={order.status === status}
                          >
                            Mark as {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
