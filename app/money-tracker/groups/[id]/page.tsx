'use client';

import { useState } from 'react';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Expense, SplitMode, Group, Member } from '@/types/money-tracker';
import { PencilIcon, UserGroupIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type EditingExpense = Omit<Expense, 'amount'> & { amount: string };

export default function GroupDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const {
        state,
        addExpense,
        deleteExpense,
        getGroupBalance,
        updateGroup,
        updateExpense,
    } = useMoneyTracker();

    const group = state.groups.find((g) => g.id === params.id);
    const balances = group ? getGroupBalance(group.id) : null;

    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [editedGroup, setEditedGroup] = useState<Partial<Group>>({});
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        paidBy: [] as string[],
        splitBetween: [] as string[],
        splitMode: 'equal' as SplitMode,
        splitDetails: {} as { [key: string]: number },
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [isEditingExpense, setIsEditingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<EditingExpense | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

    if (!group) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
                    <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    // Initialize newExpense with all group members after group check
    if (newExpense.splitBetween.length === 0) {
        setNewExpense(prev => ({
            ...prev,
            splitBetween: group.members
        }));
    }

    const handleAddExpense = () => {
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

        addExpense({
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

        setNewExpense({
            description: '',
            amount: '',
            paidBy: [],
            splitBetween: [],
            splitMode: 'equal',
            splitDetails: {},
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setIsAddingExpense(false);
    };

    const handleUpdateGroup = () => {
        if (editedGroup.name?.trim()) {
            updateGroup(group.id, editedGroup);
            setIsEditingGroup(false);
            setEditedGroup({});
        }
    };

    const handleUpdateMembers = () => {
        updateGroup(group.id, { members: selectedMembers });
        setIsManagingMembers(false);
    };

    const handleEditExpense = (expense: Expense) => {
        const editingExpense: EditingExpense = {
            ...expense,
            amount: expense.amount.toString(),
        };
        setEditingExpense(editingExpense);
        setIsEditingExpense(true);
    };

    const handleUpdateExpense = () => {
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
    };

    const handleDeleteExpense = (id: string) => {
        setDeleteConfirmation({ show: true, id });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.id) {
            deleteExpense(deleteConfirmation.id);
            setDeleteConfirmation({ show: false, id: null });
        }
    };

    // Helper to ensure all required fields are present for EditingExpense
    function ensureEditingExpense(exp: EditingExpense | null): EditingExpense {
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
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="bg-white dark:bg-transparent border-2 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300">{group.type} • {group.currency}  ~ {formatCurrency(
                            state.expenses
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
                            Manage Members
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances && Object.entries(balances).map(([memberId, balance]) => {
                        const member = state.members.find(m => m.id === memberId);
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Edit Group</h2>
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Group Name</label>
                                <input
                                    type="text"
                                    value={editedGroup.name || group.name}
                                    onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Group Type</label>
                                <select
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
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency</label>
                                <select
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
                            <div className="flex justify-end space-x-2">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isManagingMembers && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Manage Group Members</h2>
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-4" />
                        <div className="space-y-4">
                            <div className="max-h-[50vh] overflow-y-auto">
                                <div className="space-y-2">
                                    {state.members.map((member) => (
                                        <label
                                            key={member.id}
                                            className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMembers([...selectedMembers, member.id]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium">{member.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsManagingMembers(false);
                                        setSelectedMembers(group.members);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateMembers}>Save Members</Button>
                            </div>
                        </div>
                    </div>
                </div>
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
                            <Select
                                value={isEditingExpense ? editingExpense?.paidBy[0] || '' : newExpense.paidBy[0] || ''}
                                onValueChange={(value) => {
                                    if (isEditingExpense && editingExpense) {
                                        setEditingExpense({ ...editingExpense, paidBy: [value] });
                                    } else {
                                        setNewExpense({ ...newExpense, paidBy: [value] });
                                    }
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {group.members.map((memberId) => {
                                        const member = state.members.find(m => m.id === memberId);
                                        if (!member) return null;
                                        return (
                                            <SelectItem key={memberId} value={memberId}>
                                                {member.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="splitBetween" className="text-right">
                                Split Between
                            </Label>
                            <div className="col-span-3">
                                <div className="relative">
                                    <Select
                                        value={isEditingExpense ? editingExpense?.splitBetween.join(',') : newExpense.splitBetween.join(',')}
                                        onValueChange={(value) => {
                                            const currentSplit = isEditingExpense ? editingExpense?.splitBetween || [] : newExpense.splitBetween;
                                            const newSplit = currentSplit.includes(value)
                                                ? currentSplit.filter(id => id !== value)
                                                : [...currentSplit, value];

                                            if (isEditingExpense && editingExpense) {
                                                setEditingExpense({ ...editingExpense, splitBetween: newSplit });
                                            } else {
                                                setNewExpense({ ...newExpense, splitBetween: newSplit });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                {(() => {
                                                    const selectedMembers = isEditingExpense ? editingExpense?.splitBetween || [] : newExpense.splitBetween;
                                                    if (selectedMembers.length === 0) return "Select members";
                                                    return selectedMembers
                                                        .map(id => state.members.find(m => m.id === id)?.name)
                                                        .filter(Boolean)
                                                        .join(', ');
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {group.members.map((memberId) => {
                                                const member = state.members.find(m => m.id === memberId);
                                                if (!member) return null;
                                                const isSelected = isEditingExpense
                                                    ? editingExpense?.splitBetween.includes(memberId)
                                                    : newExpense.splitBetween.includes(memberId);
                                                return (
                                                    <SelectItem
                                                        key={memberId}
                                                        value={memberId}
                                                        className={`flex items-center gap-2 ${isSelected ? "bg-primary/10" : ""}`}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => { }}
                                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                                            />
                                                            <span>{member.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="splitMode" className="text-right">
                                Split Mode
                            </Label>
                            <Select
                                value={isEditingExpense ? editingExpense?.splitMode : newExpense.splitMode}
                                onValueChange={(value) => {
                                    if (isEditingExpense && editingExpense) {
                                        setEditingExpense({ ...editingExpense, splitMode: value as SplitMode });
                                    } else {
                                        setNewExpense({ ...newExpense, splitMode: value as SplitMode });
                                    }
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select split mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equal">Equal</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(isEditingExpense ? editingExpense?.splitMode === 'percentage' : newExpense.splitMode === 'percentage') && (
                            <div className="grid gap-4">
                                {group.members.map((memberId) => {
                                    const member = state.members.find(m => m.id === memberId);
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
                                    const member = state.members.find(m => m.id === memberId);
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
                        <Button onClick={isEditingExpense ? handleUpdateExpense : handleAddExpense}>
                            {isEditingExpense ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {deleteConfirmation.show && (
                <Dialog open={deleteConfirmation.show} onOpenChange={(open) => !open && setDeleteConfirmation({ show: false, id: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this expense? This action cannot be undone.
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

            <div className="bg-white dark:bg-transparent border-2 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage group expenses</p>
                    </div>
                    <Button
                        onClick={() => setIsAddingExpense(true)}
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Expense
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {state.expenses
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
                                                className="h-8 w-8"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="px-6 pb-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Paid by:</span>
                                        <span>{expense.paidBy.map(id => state.members.find(m => m.id === id)?.name).join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Split between:</span>
                                        <span>{expense.splitBetween.map(id => state.members.find(m => m.id === id)?.name).join(', ')}</span>
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
                {state.expenses.filter((expense) => expense.groupId === group.id).length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No expenses added yet</p>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddingExpense(true)}
                            className="mt-4"
                        >
                            Add your first expense
                        </Button>
                    </div>
                )}
                {state.expenses.filter((expense) => expense.groupId === group.id).length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                    state.expenses
                                        .filter((expense) => expense.groupId === group.id)
                                        .reduce((sum, expense) => sum + expense.amount, 0),
                                    group.currency
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 