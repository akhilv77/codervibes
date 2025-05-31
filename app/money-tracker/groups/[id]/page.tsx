'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Expense, SplitMode, Group, Member, Settlement } from '@/types/money-tracker';
import { PencilIcon, UserGroupIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircle2, Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loading } from '@/components/ui/loading';
import { ScrollArea } from "@/components/ui/scroll-area";

type EditingExpense = Omit<Expense, 'amount'> & { amount: string };

const initialExpenseState = {
    description: '',
    amount: '',
    paidBy: [] as string[],
    splitBetween: [] as string[],
    splitMode: 'equal' as SplitMode,
    splitDetails: {} as { [key: string]: number },
    date: new Date().toISOString().split('T')[0],
    notes: '',
};

export default function GroupDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const {
        groups = [],
        members = [],
        expenses = [],
        getGroupBalance,
        addExpense,
        updateExpense,
        deleteExpense,
        addSettlement,
        updateSettlement,
        deleteSettlement,
        updateGroup,
        isLoading,
        error,
    } = useMoneyTracker();

    const group = groups.find((g) => g.id === params.id);
    const balances = group ? getGroupBalance(group.id) : null;

    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [editedGroup, setEditedGroup] = useState<Partial<Group>>({});
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [newExpense, setNewExpense] = useState(initialExpenseState);
    const [isEditingExpense, setIsEditingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<EditingExpense | null>(null);
    const [isAddingSettlement, setIsAddingSettlement] = useState(false);
    const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [showNoMembersAlert, setShowNoMembersAlert] = useState(false);
    const [showNoGroupMembersAlert, setShowNoGroupMembersAlert] = useState(false);

    const totalExpenses = expenses
        .filter((expense: Expense) => expense.groupId === params.id)
        .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    const memberCount = group?.members?.length || 0;
    const expenseCount = expenses.filter((expense: Expense) => expense.groupId === params.id).length;

    const filteredExpenses = expenses
        .filter((expense: Expense) => expense.groupId === params.id)
        .filter((expense: Expense) =>
            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.paidBy.some((m: string) => members.find((member: Member) => member.id === m)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    // Initialize newExpense with group members when group is available
    useEffect(() => {
        if (group) {
            console.log('Group members in useEffect:', {
                groupId: group.id,
                groupMembers: group.members,
                membersLength: group.members?.length || 0,
                hasMembers: Boolean(group.members && group.members.length > 0),
                globalMembers: members.map(m => m.id),
                groupMemberIds: group.members || []
            });
            
            // Check if any global members are actually added to the group
            const hasGroupMembers = Array.isArray(group.members) && 
                group.members.length > 0 && 
                group.members.some(memberId => members.some(m => m.id === memberId));

            if (hasGroupMembers) {
                setNewExpense(prev => ({
                    ...prev,
                    splitBetween: [...group.members],
                    paidBy: prev.paidBy.length === 0 ? [group.members[0]] : prev.paidBy
                }));
            }
        }
    }, [group, members]);

    const handleAddExpenseClick = useCallback(() => {
        // Check for global members
        if (members.length === 0) {
            setShowNoMembersAlert(true);
            return;
        }

        // Check for group members
        if (!group) {
            console.error('Group not found');
            return;
        }

        // Debug group members
        console.log('Group members check:', {
            groupId: group.id,
            groupMembers: group.members,
            membersLength: group.members?.length || 0,
            hasMembers: Boolean(group.members && group.members.length > 0),
            globalMembers: members.map(m => m.id),
            groupMemberIds: group.members || []
        });

        // Check if any global members are actually added to the group
        const hasGroupMembers = Array.isArray(group.members) && 
            group.members.length > 0 && 
            group.members.some(memberId => members.some(m => m.id === memberId));
        
        if (!hasGroupMembers) {
            setShowNoGroupMembersAlert(true);
            return;
        }

        // If both checks pass, show add expense dialog
        setIsAddingExpense(true);
    }, [members, group]);

    const handleAddExpense = useCallback(async () => {
        if (!group) return;
        if (!newExpense.description || !newExpense.amount || !newExpense.paidBy.length || !newExpense.splitBetween.length) return;

        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount)) return;

        let splitDetails: { [memberId: string]: number } = {};
        if (newExpense.splitMode === 'equal') {
            const share = amount / newExpense.splitBetween.length;
            newExpense.splitBetween.forEach((memberId) => {
                splitDetails[memberId] = share;
            });
        } else if (newExpense.splitMode === 'percentage') {
            const totalPercentage = Object.values(newExpense.splitDetails).reduce(
                (sum, val) => sum + parseFloat(val.toString()),
                0
            );
            if (Math.abs(totalPercentage - 100) > 0.01) return;

            Object.entries(newExpense.splitDetails).forEach(([memberId, percentage]) => {
                splitDetails[memberId] = (amount * parseFloat(percentage.toString())) / 100;
            });
        } else if (newExpense.splitMode === 'manual') {
            const totalManual = Object.values(newExpense.splitDetails).reduce(
                (sum, val) => sum + parseFloat(val.toString()),
                0
            );
            if (Math.abs(totalManual - amount) > 0.01) return;
            Object.entries(newExpense.splitDetails).forEach(([memberId, value]) => {
                splitDetails[memberId] = parseFloat(value.toString());
            });
        }

        try {
            await addExpense({
                groupId: group.id,
                description: newExpense.description,
                amount,
                paidBy: newExpense.paidBy,
                splitBetween: newExpense.splitBetween,
                splitMode: newExpense.splitMode,
                splitDetails,
                date: newExpense.date,
                notes: newExpense.notes,
            });

            setNewExpense(initialExpenseState);
            setIsAddingExpense(false);
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    }, [newExpense, group, addExpense]);

    const handleUpdateGroup = useCallback(() => {
        if (!group) return;
        if (editedGroup.name?.trim()) {
            updateGroup(group.id, editedGroup);
            setIsEditingGroup(false);
            setEditedGroup({});
        }
    }, [editedGroup, group, updateGroup]);

    const handleUpdateMembers = useCallback(() => {
        if (!group) return;
        updateGroup(group.id, { members: selectedMembers });
        setIsManagingMembers(false);
    }, [selectedMembers, group, updateGroup]);

    const handleEditExpense = useCallback((expense: Expense) => {
        // Convert split details to percentages if split mode is percentage
        let splitDetails = { ...expense.splitDetails };
        if (expense.splitMode === 'percentage') {
            const totalAmount = expense.amount;
            Object.keys(splitDetails).forEach(memberId => {
                const amount = splitDetails[memberId];
                splitDetails[memberId] = (amount / totalAmount) * 100;
            });
        }

        const editingExpense: EditingExpense = {
            ...expense,
            amount: expense.amount.toString(),
            splitDetails
        };
        setEditingExpense(editingExpense);
        setIsEditingExpense(true);
    }, []);

    const handleUpdateExpense = useCallback(() => {
        if (!editingExpense) return;

        const amount = parseFloat(editingExpense.amount);
        if (isNaN(amount)) return;

        let splitDetails: { [memberId: string]: number } = {};
        if (editingExpense.splitMode === 'equal') {
            const share = amount / editingExpense.splitBetween.length;
            editingExpense.splitBetween.forEach((memberId) => {
                splitDetails[memberId] = share;
            });
        } else if (editingExpense.splitMode === 'percentage') {
            const totalPercentage = Object.values(editingExpense.splitDetails).reduce(
                (sum, val) => sum + parseFloat(val.toString()),
                0
            );
            if (Math.abs(totalPercentage - 100) > 0.01) return;

            Object.entries(editingExpense.splitDetails).forEach(([memberId, percentage]) => {
                splitDetails[memberId] = (amount * parseFloat(percentage.toString())) / 100;
            });
        } else if (editingExpense.splitMode === 'manual') {
            const totalManual = Object.values(editingExpense.splitDetails).reduce(
                (sum, val) => sum + parseFloat(val.toString()),
                0
            );
            if (Math.abs(totalManual - amount) > 0.01) return;
            Object.entries(editingExpense.splitDetails).forEach(([memberId, value]) => {
                splitDetails[memberId] = parseFloat(value.toString());
            });
        }

        const updatedExpense: Expense = {
            ...editingExpense,
            amount,
            splitDetails,
        };

        updateExpense(editingExpense.id, updatedExpense);

        setEditingExpense(null);
        setIsEditingExpense(false);
    }, [editingExpense, updateExpense]);

    const handleDeleteExpense = useCallback((id: string) => {
        setDeleteConfirmation({ show: true, id });
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteConfirmation.id) {
            deleteExpense(deleteConfirmation.id);
            setDeleteConfirmation({ show: false, id: null });
        }
    }, [deleteConfirmation.id, deleteExpense]);

    // Helper to ensure all required fields are present for EditingExpense
    const ensureEditingExpense = useCallback((exp: EditingExpense | null): EditingExpense => {
        if (!exp) throw new Error('editingExpense is null');
        return {
            id: exp.id!,
            groupId: exp.groupId!,
            description: exp.description!,
            paidBy: exp.paidBy!,
            splitBetween: exp.splitBetween!,
            splitMode: exp.splitMode!,
            splitDetails: exp.splitDetails!,
            date: exp.date!,
            notes: exp.notes || '',
            amount: exp.amount,
            createdAt: exp.createdAt!,
            updatedAt: exp.updatedAt!
        };
    }, []);

    if (isLoading) {
        return (
            <Loading
                variant="default"
                size="lg"
                text="Loading group details..."
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

    if (!group) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-red-500">Group not found</p>
                    <Button onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="bg-white dark:bg-transparent border-2 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300">{group.type} • {group.currency}  ~ {formatCurrency(
                            expenses
                                .filter(expense => expense.groupId === group.id)
                                .reduce((sum, expense) => sum + expense.amount, 0),
                            group.currency
                        )}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setEditedGroup(group);
                                setIsEditingGroup(true);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                        >
                            <PencilIcon className="h-4 w-4 mr-1.5" />
                            Edit Group
                        </button>
                        <button
                            onClick={() => {
                                setSelectedMembers(group.members);
                                setIsManagingMembers(true);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                        >
                            <UserGroupIcon className="h-4 w-4 mr-1.5" />
                            Manage Group Members
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances && Object.entries(balances).map(([memberId, balance]) => {
                        const member = members.find(m => m.id === memberId);
                        if (!member) return null;

                        return (
                            <div key={memberId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{member.name}</h3>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Owed: <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(balance.owed)}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Owes: <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(balance.owes)}</span>
                                    </p>
                                    <p className="text-sm font-medium">
                                        Net: <span className={balance.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                            {formatCurrency(balance.net)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isEditingGroup && (
                <Dialog open={isEditingGroup} onOpenChange={(open) => {
                    if (!open) {
                        setIsEditingGroup(false);
                        setEditedGroup({});
                    }
                }}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Group</DialogTitle>
                            <DialogDescription>
                                Update the group details below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Group Name</Label>
                                <Input
                                    id="name"
                                    value={editedGroup.name || group.name}
                                    onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Group Type</Label>
                                <select
                                    id="type"
                                    value={editedGroup.type || group.type}
                                    onChange={(e) => setEditedGroup({ ...editedGroup, type: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="Trip">Trip</option>
                                    <option value="Family">Family</option>
                                    <option value="Business">Business</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <select
                                    id="currency"
                                    value={editedGroup.currency || group.currency}
                                    onChange={(e) => setEditedGroup({ ...editedGroup, currency: e.target.value as Group['currency'] })}
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
                                    setIsEditingGroup(false);
                                    setEditedGroup({});
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateGroup}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {isManagingMembers && (
                <Dialog open={isManagingMembers} onOpenChange={setIsManagingMembers}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Manage Group Members</DialogTitle>
                            <DialogDescription>
                                Select members to add to this group.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                        <div className="grid gap-4 py-4">
                            <div className="flex justify-end">
                                <Button asChild variant="outline" size="sm">
                                    <a href={`/money-tracker/members?alert=true&redirect=${group?.id}`} className="flex items-center">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Member
                                    </a>
                                </Button>
                            </div>
                            <ScrollArea className="h-[300px] rounded-md border p-4">
                                <div className="grid gap-4">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={member.id}
                                                checked={selectedMembers.includes(member.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedMembers([...selectedMembers, member.id]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={member.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-primary transition-colors"
                                            >
                                                {member.name}
                                            </label>
                                        </div>
                                    ))}
                                    {members.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No members available. Add members first.
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsManagingMembers(false);
                                    setSelectedMembers([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateMembers}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add/Edit Expense Modal */}
            <Dialog
                open={isAddingExpense || isEditingExpense}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddingExpense(false);
                        setIsEditingExpense(false);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[600px] z-[100]">
                    <DialogHeader>
                        <DialogTitle>{isEditingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                    </DialogHeader>
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                    {(!group?.members || group.members.length === 0) ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] px-2">
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                No members in this group. Add members to start tracking expenses.
                            </p>
                            <Button 
                                variant="outline" 
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setSelectedMembers(group?.members || []);
                                    setIsManagingMembers(true);
                                    setIsAddingExpense(false);
                                }}
                            >
                                <UserGroupIcon className="h-4 w-4 mr-2" />
                                Manage Group Members
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    value={isEditingExpense ? editingExpense?.description : newExpense.description}
                                    onChange={(e) => {
                                        if (isEditingExpense && editingExpense) {
                                            setEditingExpense({ ...ensureEditingExpense(editingExpense), description: e.target.value });
                                        } else {
                                            setNewExpense({ ...newExpense, description: e.target.value });
                                        }
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={isEditingExpense ? editingExpense?.amount : newExpense.amount}
                                    onChange={(e) => {
                                        if (isEditingExpense && editingExpense) {
                                            setEditingExpense({ ...ensureEditingExpense(editingExpense), amount: e.target.value });
                                        } else {
                                            setNewExpense({ ...newExpense, amount: e.target.value });
                                        }
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paidBy" className="text-right">
                                    Paid By
                                </Label>
                                <div className="col-span-3">
                                    <select
                                        id="paidBy"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        value={isEditingExpense ? editingExpense?.paidBy[0] || '' : newExpense.paidBy[0] || ''}
                                        onChange={(e) => {
                                            const selectedMemberId = e.target.value;
                                            if (isEditingExpense && editingExpense) {
                                                setEditingExpense({ 
                                                    ...editingExpense, 
                                                    paidBy: selectedMemberId ? [selectedMemberId] : [] 
                                                });
                                            } else {
                                                setNewExpense({ 
                                                    ...newExpense, 
                                                    paidBy: selectedMemberId ? [selectedMemberId] : [] 
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">Select member</option>
                                        {group.members.map((memberId) => {
                                            const member = members.find(m => m.id === memberId);
                                            if (!member) return null;
                                            return (
                                                <option key={memberId} value={memberId}>
                                                    {member.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Split Between</Label>
                                <div className="col-span-3">
                                    {(!group || !group.members || group.members.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center min-h-[120px] border rounded-md p-4">
                                            <p className="text-sm text-muted-foreground text-center mb-4">
                                                No members in this group. Add members to split expenses.
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className="w-full sm:w-auto"
                                                onClick={() => {
                                                    setSelectedMembers(group?.members || []);
                                                    setIsManagingMembers(true);
                                                    setIsAddingExpense(false);
                                                }}
                                            >
                                                <UserGroupIcon className="h-4 w-4 mr-2" />
                                                Manage Group Members
                                            </Button>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[200px] rounded-md border p-4">
                                            <div className="space-y-2">
                                                {group.members.map((memberId) => {
                                                    const member = members.find(m => m.id === memberId);
                                                    if (!member) return null;
                                                    return (
                                                        <div key={memberId} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`split-${memberId}`}
                                                                checked={isEditingExpense
                                                                    ? editingExpense?.splitBetween.includes(memberId)
                                                                    : newExpense.splitBetween.includes(memberId)
                                                                }
                                                                onCheckedChange={(checked) => {
                                                                    const currentSplit = isEditingExpense
                                                                        ? [...(editingExpense?.splitBetween || [])]
                                                                        : [...newExpense.splitBetween];

                                                                    if (checked) {
                                                                        currentSplit.push(memberId);
                                                                    } else {
                                                                        const index = currentSplit.indexOf(memberId);
                                                                        if (index > -1) {
                                                                            currentSplit.splice(index, 1);
                                                                        }
                                                                    }

                                                                    if (isEditingExpense && editingExpense) {
                                                                        setEditingExpense({
                                                                            ...editingExpense,
                                                                            splitBetween: currentSplit
                                                                        });
                                                                    } else {
                                                                        setNewExpense({
                                                                            ...newExpense,
                                                                            splitBetween: currentSplit
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`split-${memberId}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-primary transition-colors"
                                                            >
                                                                {member.name}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="splitMode" className="text-right">
                                    Split Mode
                                </Label>
                                <div className="col-span-3">
                                    <select
                                        id="splitMode"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        value={isEditingExpense ? editingExpense?.splitMode : newExpense.splitMode}
                                        onChange={(e) => {
                                            const newSplitMode = e.target.value as SplitMode;
                                            if (isEditingExpense && editingExpense) {
                                                setEditingExpense({
                                                    ...editingExpense,
                                                    splitMode: newSplitMode,
                                                    splitDetails: {} // Clear split details when changing mode
                                                });
                                            } else {
                                                setNewExpense({
                                                    ...newExpense,
                                                    splitMode: newSplitMode,
                                                    splitDetails: {} // Clear split details when changing mode
                                                });
                                            }
                                        }}
                                    >
                                        <option value="equal">Equal</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                            </div>
                            {(isEditingExpense ? editingExpense?.splitMode === 'percentage' : newExpense.splitMode === 'percentage') && (
                                <div className="grid gap-4">
                                    {group.members.map((memberId) => {
                                        const member = members.find(m => m.id === memberId);
                                        if (!member) return null;
                                        return (
                                            <div key={memberId} className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor={`percentage-${memberId}`} className="text-right">
                                                    {member.name}
                                                </Label>
                                                <Input
                                                    id={`percentage-${memberId}`}
                                                    type="number"
                                                    value={isEditingExpense ? editingExpense?.splitDetails[memberId] || '' : newExpense.splitDetails[memberId] || ''}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        if (isEditingExpense && editingExpense) {
                                                            setEditingExpense({
                                                                ...editingExpense,
                                                                splitDetails: {
                                                                    ...editingExpense.splitDetails,
                                                                    [memberId]: value
                                                                }
                                                            });
                                                        } else {
                                                            setNewExpense({
                                                                ...newExpense,
                                                                splitDetails: {
                                                                    ...newExpense.splitDetails,
                                                                    [memberId]: value
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {(isEditingExpense ? editingExpense?.splitMode === 'manual' : newExpense.splitMode === 'manual') && (
                                <div className="grid gap-4">
                                    {group.members.map((memberId) => {
                                        const member = members.find(m => m.id === memberId);
                                        if (!member) return null;
                                        return (
                                            <div key={memberId} className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor={`amount-${memberId}`} className="text-right">
                                                    {member.name}
                                                </Label>
                                                <Input
                                                    id={`amount-${memberId}`}
                                                    type="number"
                                                    value={isEditingExpense ? editingExpense?.splitDetails[memberId] || '' : newExpense.splitDetails[memberId] || ''}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        if (isEditingExpense && editingExpense) {
                                                            setEditingExpense({
                                                                ...editingExpense,
                                                                splitDetails: {
                                                                    ...editingExpense.splitDetails,
                                                                    [memberId]: value
                                                                }
                                                            });
                                                        } else {
                                                            setNewExpense({
                                                                ...newExpense,
                                                                splitDetails: {
                                                                    ...newExpense.splitDetails,
                                                                    [memberId]: value
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            if (isEditingExpense) {
                                setIsEditingExpense(false);
                            } else {
                                setIsAddingExpense(false);
                            }
                        }}>
                            Cancel
                        </Button>
                        {group?.members && group.members.length > 0 && (
                            <Button onClick={isEditingExpense ? handleUpdateExpense : handleAddExpense}>
                                {isEditingExpense ? 'Update' : 'Add'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {deleteConfirmation.show && (
                <Dialog open={deleteConfirmation.show} onOpenChange={(open) => !open && setDeleteConfirmation({ show: false, id: null })}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this expense? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
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

            <div className="bg-white dark:bg-transparent border-2 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage group expenses</p>
                    </div>
                    <Button
                        onClick={handleAddExpenseClick}
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Expense
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {expenses
                        .filter((expense) => expense.groupId === group.id)
                        .map((expense) => (
                            <Card key={expense.id} className="hover:shadow-lg transition-shadow duration-200 dark:border-white">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium">{expense.description}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </CardDescription>
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(expense.amount, group.currency)}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditExpense(expense)}
                                                className="h-8 w-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="h-8 w-8 text-destructive bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="px-6 pb-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Paid by:</span>
                                        <span>{expense.paidBy.map(id => members.find(m => m.id === id)?.name).join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Split between:</span>
                                        <span>{expense.splitBetween.map(id => members.find(m => m.id === id)?.name).join(', ')}</span>
                                    </div>
                                    {expense.notes && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            {expense.notes}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                </div>
                {expenses.filter((expense) => expense.groupId === group.id).length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No expenses added yet</p>
                        <Button
                            variant="outline"
                            onClick={handleAddExpenseClick}
                            className="mt-4"
                        >
                            Add your first expense
                        </Button>
                    </div>
                )}
                {expenses.filter((expense) => expense.groupId === group.id).length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                    expenses
                                        .filter((expense) => expense.groupId === group.id)
                                        .reduce((sum, expense) => sum + expense.amount, 0),
                                    group.currency
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* No Global Members Alert */}
            <Dialog open={showNoMembersAlert} onOpenChange={setShowNoMembersAlert}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>No Members Available</DialogTitle>
                        <DialogDescription>
                            You need to add members first before tracking expenses.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowNoMembersAlert(false)}
                        >
                            Cancel
                        </Button>
                        <Button asChild>
                            <a href={`/money-tracker/members?alert=true&redirect=${group?.id}`}>
                                Add New Member
                            </a>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* No Group Members Alert */}
            <Dialog open={showNoGroupMembersAlert} onOpenChange={setShowNoGroupMembersAlert}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>No Members in Group</DialogTitle>
                        <DialogDescription>
                            You need to add members to this group before tracking expenses.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowNoGroupMembersAlert(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowNoGroupMembersAlert(false);
                                setSelectedMembers(group?.members || []);
                                setIsManagingMembers(true);
                            }}
                        >
                            Manage Group Members
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 