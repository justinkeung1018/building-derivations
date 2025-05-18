import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuToggle,
  SidebarSeparator,
} from "./shadcn/SideBar";
import { Download, Eye } from "lucide-react";
import { EditorSheet } from "./editors/EditorSheet";
import { SyntaxRule, InferenceRule } from "@/lib/types/rules";

interface AppSidebarProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <EditorSheet {...props} />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Download />
                  <span>Export derivation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Toggles</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuToggle>
                <Eye />
                <span>Show syntax rules</span>
              </SidebarMenuToggle>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuToggle>
                <Eye />
                <span>Show inference rules</span>
              </SidebarMenuToggle>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
