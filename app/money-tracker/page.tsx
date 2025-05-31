'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Group, Expense, Currency, GroupType } from '@/types/money-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { Loading } from '@/components/ui/loading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MoneyTrackerPage() {
    const { trackServiceUsage } = useServiceTracking();
    const {
        groups = [],
        members = [],
        expenses = [],
        settlements = [],
        addGroup,
        updateGroup,
        deleteGroup,
        addMember,
        updateMember,
        deleteMember,
        addExpense,
        updateExpense,
        deleteExpense,
        addSettlement,
        updateSettlement,
        deleteSettlement,
        getGroupBalance,
        isLoading,
        error,
    } = useMoneyTracker();

    const naviagte = useRouter();
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState<GroupType>('trip');
    const [newGroupCurrency, setNewGroupCurrency] = useState<Currency>('USD');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

    useEffect(() => {
        trackServiceUsage('Money Tracker', 'page_view');
    }, []);

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            setEditingGroup(null);
            setNewGroupName('');
        }
        setIsAddingGroup(open);
    };

    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open) {
            setDeleteConfirmation({ show: false, id: null });
        }
    };

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            await addGroup({
                name: newGroupName,
                type: newGroupType,
                currency: newGroupCurrency,
                members: [],
            });

            setNewGroupName('');
            setNewGroupType('trip');
            setNewGroupCurrency('USD');
            setIsAddingGroup(false);
        } catch (error) {
            console.error('Error adding group:', error);
        }
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
        setNewGroupType(group.type);
        setNewGroupCurrency(group.currency);
        setIsAddingGroup(true);
        trackServiceUsage('Money Tracker', 'group_edit_started', `Group: ${group.name}`);
    };

    const handleSaveEdit = async () => {
        if (!editingGroup) return;

        try {
            await updateGroup(editingGroup.id, {
                name: newGroupName,
                type: newGroupType,
                currency: newGroupCurrency,
            });
            setEditingGroup(null);
            setIsAddingGroup(false);
        } catch (error) {
            console.error('Error updating group:', error);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        setDeleteConfirmation({ show: true, id: groupId });
    };

    const confirmDeleteGroup = () => {
        if (deleteConfirmation.id) {
            deleteGroup(deleteConfirmation.id);
            setDeleteConfirmation({ show: false, id: null });
        }
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.type?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <Loading
                variant="default"
                size="lg"
                text="Loading money tracker..."
                fullScreen
            />
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                <div className="flex flex-wrap gap-2">
                    <Link href="/money-tracker/members">
                        <Button variant="outline" className="w-full sm:w-auto">Manage Members</Button>
                    </Link>
                    <Button onClick={() => setIsAddingGroup(true)} className="w-full sm:w-auto">Add Group</Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search groups by name or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>

            <Dialog open={isAddingGroup} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
                        <DialogDescription>
                            {editingGroup ? 'Update the group details below.' : 'Create a new group to start tracking expenses.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Group Name</label>
                            <Input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Enter group name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Group Type</label>
                            <select
                                value={newGroupType}
                                onChange={(e) => setNewGroupType(e.target.value as Group['type'])}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="Trip">Trip</option>
                                <option value="Family">Family</option>
                                <option value="Business">Business</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Currency</label>
                            <select
                                value={newGroupCurrency}
                                onChange={(e) => setNewGroupCurrency(e.target.value as Group['currency'])}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                                <option value="JPY">JPY</option>
                                <option value="CAD">CAD</option>
                                <option value="AUD">AUD</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddingGroup(false);
                                setEditingGroup(null);
                                setNewGroupName('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={editingGroup ? handleSaveEdit : handleAddGroup}>
                            {editingGroup ? 'Save Changes' : 'Create Group'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteConfirmation.show} onOpenChange={(open) => setDeleteConfirmation({ show: open, id: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the group and all its associated expenses. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteGroup}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">
                        {searchQuery ? 'No Matching Groups Found' : 'No Groups Yet'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchQuery
                            ? 'Try adjusting your search query'
                            : 'Create your first group to start tracking expenses'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredGroups.map((group) => {
                        const totalExpenses = expenses
                            .filter((expense: Expense) => expense.groupId === group.id)
                            .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

                        const memberCount = group.members?.filter(memberId => 
                            members.some(m => m.id === memberId)
                        ).length || 0;
                        const expenseCount = expenses.filter((expense: Expense) => expense.groupId === group.id).length;

                        return (
                            <Card key={group.id} className="group hover:shadow-lg transition-all duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                {group.name}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {group.type} • {group.currency || 'USD'}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditGroup(group)}
                                                className="h-8 w-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="h-8 w-8 text-destructive bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="px-6 pb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(totalExpenses, group.currency || 'USD')}
                                            </p>
                                        </div>
                                        <div className="space-y-1 flex flex-col items-end">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {memberCount}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>{expenseCount} expenses</span>
                                        <Button onClick={() => naviagte.push(`/money-tracker/groups/${group.id}`)}>View Details</Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
} 