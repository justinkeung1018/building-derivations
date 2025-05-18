import React, { useState } from "react";
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
} from "../shadcn/Sidebar";
import { Download, Eye } from "lucide-react";
import { EditorSheet } from "../editors/EditorSheet";
import { SyntaxRule, InferenceRule } from "@/lib/types/rules";
import { SyntaxViewer } from "./SyntaxViewer";
import { InferenceRulesViewer } from "./InferenceRulesViewer";

interface AppSidebarProps {
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
}

export function AppSidebar(props: AppSidebarProps) {
  const [showSyntax, setShowSyntax] = useState(false);
  const [showInferenceRules, setShowInferenceRules] = useState(false);

  return (
    <div className="flex">
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
                <SidebarMenuToggle
                  isActive={showSyntax}
                  onPressedChange={(pressed) => {
                    setShowSyntax(pressed);
                  }}
                >
                  <Eye />
                  <span>Show syntax rules</span>
                </SidebarMenuToggle>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuToggle
                  isActive={showInferenceRules}
                  onPressedChange={(pressed) => {
                    setShowInferenceRules(pressed);
                  }}
                >
                  <Eye />
                  <span>Show inference rules</span>
                </SidebarMenuToggle>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      {(showSyntax || showInferenceRules) && (
        <div className="mx-2 py-2 flex flex-col gap-y-2 max-h-screen items-stretch">
          {showSyntax && <SyntaxViewer syntax={props.syntax} />}
          {showInferenceRules && <InferenceRulesViewer inferenceRules={props.inferenceRules} />}
        </div>
      )}
    </div>
  );
}
