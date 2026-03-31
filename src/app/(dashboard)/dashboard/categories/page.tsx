"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useListCategories,
  useCreateCategory,
} from "@/modules/categories/api";
import { categoryCreateSchema, type CategoryCreateInput } from "@/modules/categories/schemas";
import { ApiClientError } from "@/shared/client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function CategoriesPage() {
  const [skip, setSkip] = useState(0);
  const limit = 10;

  // Query categories
  const {
    data,
    isLoading: isLoadingList,
    error: listError,
  } = useListCategories({
    skip,
    limit,
  });

  // Create category mutation
  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateCategory();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryCreateInput>({
    resolver: zodResolver(categoryCreateSchema),
  });

  // Show list error if it's an ApiClientError
  if (listError instanceof ApiClientError) {
    // Format validation error message
    let errorMessage = listError.message;
    if (
      listError.isCode("VALIDATION_ERROR") &&
      listError.details
    ) {
      const details = listError.details as any;
      if (Array.isArray(details.issues) && details.issues.length > 0) {
        errorMessage = details.issues[0].message;
      }
    }

    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 border-destructive bg-destructive/5">
          <h2 className="text-lg font-semibold text-destructive">
            Failed to load categories
          </h2>
          <p className="text-sm text-destructive/80 mt-2">{errorMessage}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Handle create
  const onSubmit = (formData: CategoryCreateInput) => {
    createCategory(formData, {
      onSuccess: (category) => {
        toast.success(`Category "${category.name}" created successfully!`);
        reset();
      },
      onError: (error) => {
        // Extract first issue from validation error
        let errorMessage = error.message;
        if (
          error.isCode("VALIDATION_ERROR") &&
          error.details
        ) {
          const details = error.details as any;
          if (Array.isArray(details.issues) && details.issues.length > 0) {
            errorMessage = details.issues[0].message;
          }
        }

        toast.error(errorMessage);
      },
    });
  };

  const categories = data?.categories ?? [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Manage product categories
        </p>
      </div>

      {/* Create Form */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g., Electronics, Clothing, Books"
              {...register("name")}
              disabled={isCreatingCategory}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isCreatingCategory}
            className="w-full"
          >
            {isCreatingCategory ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </Card>

      {/* Categories List */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {isLoadingList ? "Loading..." : "Categories"}
          </h2>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {categories.length} of {pagination.total} categories
            </p>
          )}
        </div>

        {isLoadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-secondary rounded animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one using the form above
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="font-mono text-xs truncate max-w-xs">
                    {category.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.hasMore && (
          <Button
            onClick={() => setSkip(skip + limit)}
            variant="outline"
            className="w-full mt-6"
            disabled={isLoadingList}
          >
            Load More
          </Button>
        )}
      </Card>
    </div>
  );
}
