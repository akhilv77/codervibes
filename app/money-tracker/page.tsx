'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Group } from '@/types/money-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function MoneyTrackerPage() {
    const {
        state,
        addGroup,
        deleteGroup,
        getGroupBalance,
    } = useMoneyTracker();

    const naviagte = useRouter();
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState<Group['type']>('Trip');
    const [newGroupCurrency, setNewGroupCurrency] = useState<Group['currency']>('USD');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;

        addGroup({
            name: newGroupName.trim(),
            type: newGroupType,
            currency: newGroupCurrency,
            members: [],
        });

        setNewGroupName('');
        setIsAddingGroup(false);
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
        setNewGroupType(group.type);
        setNewGroupCurrency(group.currency);
        setIsAddingGroup(true);
    };

    const handleSaveEdit = () => {
        if (!editingGroup || !newGroupName.trim()) return;

        // Update the group with new values
        const updatedGroup = {
            ...editingGroup,
            name: newGroupName.trim(),
            type: newGroupType,
            currency: newGroupCurrency,
        };

        // Here you would typically call an update function from your hook
        // For now, we'll just close the dialog
        setEditingGroup(null);
        setNewGroupName('');
        setIsAddingGroup(false);
    };

    const handleDeleteGroup = (id: string) => {
        setDeleteConfirmation({ show: true, id });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.id) {
            deleteGroup(deleteConfirmation.id);
            setDeleteConfirmation({ show: false, id: null });
        }
    };

    const filteredGroups = state.groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {isAddingGroup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingGroup ? 'Edit Group' : 'Add New Group'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Group Name</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter group name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Group Type</label>
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
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency</label>
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
                            <div className="flex justify-end space-x-2">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmation.show && (
                <Dialog open={deleteConfirmation.show} onOpenChange={(open) => !open && setDeleteConfirmation({ show: false, id: null })}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this group? This will also delete all associated expenses and cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

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
                        const totalExpenses = state.expenses
                            .filter((expense) => expense.groupId === group.id)
                            .reduce((sum, expense) => sum + expense.amount, 0);

                        const memberCount = group.members.length;
                        const expenseCount = state.expenses.filter((expense) => expense.groupId === group.id).length;

                        return (
                            <Card key={group.id} className="group hover:shadow-lg transition-all duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                {group.name}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {group.type} • {group.currency}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditGroup(group)}
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                {formatCurrency(totalExpenses, group.currency)}
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