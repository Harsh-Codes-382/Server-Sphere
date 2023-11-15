"use client";
// Imported "zod" for form validation
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";
import qs from "query-string";
import {
  Dialog,
  DialogContent,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import { useEffect } from "react";

// Created the form Schema
const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required.",
    })
    .refine(
      // So the user can never create the channel name "general"
      (name) => name != "general",
      {
        message: "Channel name cannot be 'General'",
      }
    ),
  //   Import the chnnel type options from prisma client (There is a enum of channelType in schema)
  type: z.nativeEnum(ChannelType),
});

export const EditChannelModal = () => {
  const router = useRouter();

  const { isOpen, onClose, type, data } = useModal();

  const IsModalOpen = isOpen && type === "editChannel";

  const {channel, server } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

//   Because this component is already rendered so that's why we are setting the value in useEffect()
  useEffect(() => {
    if(channel){
        form.setValue("name", channel.name);
        form.setValue("type", channel.type)
    }
  }, [form, channel]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        // Send the serverId as  a query in route backend so we know in which server channel is to create
        query: {
          serverId: server?.id,
        },
      });

    //   Sending the input field values in backend using axios in Patch request method means just to update
      await axios.patch(url, values);
      form.reset();
      router.refresh();

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  // To close the modal
  const handleClose = () => {
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
              Edit Your Channel
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            {/* We are passing our onSubmit() here using the handleSubmit from Form hook */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-8 px-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Channel Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Channel Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                            <SelectValue placeholder="Select a Channel type " />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {Object.values(ChannelType).map((channel) => (
                            <SelectItem
                              key={channel}
                              value={channel}
                              className="capitalize">
                              {channel.toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
