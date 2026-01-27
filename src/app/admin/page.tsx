'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';

import { useFirestore, useCollection } from '@/firebase';
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
import { Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';


export default function AdminDashboard() {
  const firestore = useFirestore();
  const ordersCollection = useMemo(() => (
    firestore ? collection(firestore, 'orders') : null
  ), [firestore]);
  const { data: orders, loading } = useCollection<Order>(ordersCollection);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Here are the latest orders placed on your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product(s)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                [...orders].sort((a, b) => b.createdAt.seconds - b.createdAt.seconds).slice(0,5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.createdAt?.seconds 
                        ? format(new Date(order.createdAt.seconds * 1000), 'PP')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.phone}</div>
                    </TableCell>
                    <TableCell>
                      {order.items && order.items.length > 0 ? (
                        <>
                          {order.items[0].productName}
                          {order.items.length > 1 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              + {order.items.length - 1} more
                            </span>
                          )}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right">৳{order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
