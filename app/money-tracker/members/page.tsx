'use client';

import { useState } from 'react';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { getGravatarUrl, getInitials } from '@/lib/utils';
import type { Member } from '@/types/money-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

export default function MembersPage() {
    const {
        members,
        isLoading,
        error,
        addMember,
        updateMember,
        deleteMember
    } = useMoneyTracker();

    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isEditingMember, setIsEditingMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

    if (isLoading) {
        return (
            <Loading
                variant="default"
                size="lg"
                text="Loading members..."
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

    const handleAddMember = async () => {
        if (!newMemberName.trim() || !newMemberEmail.trim()) return;

        try {
            await addMember({
                name: newMemberName.trim(),
                email: newMemberEmail.trim().toLowerCase(),
            });

            setNewMemberName('');
            setNewMemberEmail('');
            setIsAddingMember(false);
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleEditMember = (member: Member) => {
        setEditingMember(member);
        setNewMemberName(member.name);
        setNewMemberEmail(member.email);
        setIsEditingMember(true);
    };

    const handleUpdateMember = async () => {
        if (!editingMember || !newMemberName.trim() || !newMemberEmail.trim()) return;

        try {
            await updateMember(editingMember.id, {
                name: newMemberName.trim(),
                email: newMemberEmail.trim().toLowerCase(),
            });

            setEditingMember(null);
            setNewMemberName('');
            setNewMemberEmail('');
            setIsEditingMember(false);
        } catch (error) {
            console.error('Error updating member:', error);
        }
    };

    const handleDeleteMember = async (id: string) => {
        try {
            await deleteMember(id);
            setDeleteConfirmation({ show: false, id: null });
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Members</h1>
                <Button onClick={() => setIsAddingMember(true)}>Add Member</Button>
            </div>

            <Dialog open={isAddingMember || isEditingMember} onOpenChange={(open) => {
                if (!open) {
                    setIsAddingMember(false);
                    setIsEditingMember(false);
                    setEditingMember(null);
                    setNewMemberName('');
                    setNewMemberEmail('');
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                        <DialogDescription>
                            {isEditingMember ? 'Update the member details below.' : 'Add a new member to your expense tracking group.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter member name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter member email"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddingMember(false);
                            setIsEditingMember(false);
                            setEditingMember(null);
                            setNewMemberName('');
                            setNewMemberEmail('');
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={isEditingMember ? handleUpdateMember : handleAddMember}>
                            {isEditingMember ? 'Update Member' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {deleteConfirmation.show && (
                <Dialog open={deleteConfirmation.show} onOpenChange={(open) => !open && setDeleteConfirmation({ show: false, id: null })}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this member? This action cannot be undone.
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
                                onClick={() => deleteConfirmation.id && handleDeleteMember(deleteConfirmation.id)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {members.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No Members Yet</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add members to start tracking expenses
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-lg font-medium">
                                                {getInitials(member.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{member.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {member.email}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditMember(member)}
                                        className="h-8 w-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteConfirmation({ show: true, id: member.id })}
                                        className="h-8 w-8 text-destructive bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 