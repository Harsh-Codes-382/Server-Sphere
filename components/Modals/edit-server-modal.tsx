"use client";
// Imported "zod" for form validation
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";

// Created the form Schema
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Server face is required",
  }),
});

export const EditServerModal = () => {
  const router = useRouter();
  // Destructuring from modal Store
  const { isOpen, onClose, type, data } = useModal();

  const { server } = data;

  // This holds whether this madal is open or not
  const IsModalOpen = isOpen && type === "editServer";

  const form = useForm({
    // Now connect the formSchema to this form
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  //   So, when this modal appears it already have the pre filled values from "server" which is from data from modalStore
  useEffect(() => {
    if (server) {
      // Set The values to form
      form.setValue("name", server.name);
      form.setValue("imageUrl", server.imageUrl);
    }
  }, [server, form]);

  // This is loading state during form is submitting
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Making an API call for saving the changes for servers on Submit of name & Image
      await axios.patch(`/api/servers/${server?.id}`, values);
      form.reset();
      router.refresh();
      //   To close the modal as soon as you click on submit
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  // To close the modal
  const handleClose = () => {
    // Just reset the form and call the close function from modal store
    form.reset();
    onClose();
  };

  return (
    <>
      {/* This is all written as same as in "Shadcn" components like Dialog, Form */}

      <Dialog open={IsModalOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Create Your Server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Give your Server a Name and image like it Suits. You can always
              change later if you feel like it.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            {/* We are passing our onSubmit() here using the handleSubmit from Form hook */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-8 px-6">
                <div className="flex items-center justify-center text-center ">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            endpoint="serverImage"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Server Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="bg-gray-100 px-6 py-4">
                {/* "primary is a custom variant we created in Button.tsx" */}
                <Button variant="primary" disabled={isLoading}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
