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
import { Download, Eye, Upload } from "lucide-react";
import { EditorSheet } from "../editors/EditorSheet";
import { SyntaxRule, InferenceRule } from "@/lib/types/rules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn/DropdownMenu";
import { exportDerivation, importDerivation } from "@/lib/io/derivation";
import { ArgumentInputState } from "@/lib/types/argumentinput";
import { cn } from "@/lib/utils";
import { SyntaxViewer } from "./SyntaxViewer";
import { InferenceRulesViewer } from "./InferenceRulesViewer";
import { SyntaxGuideViewer } from "./SyntaxGuideViewer";

interface AppSidebarProps {
  valid: boolean;
  syntax: SyntaxRule[];
  inferenceRules: InferenceRule[];
  states: Record<number, ArgumentInputState>;
  setSyntax: React.Dispatch<React.SetStateAction<SyntaxRule[]>>;
  setInferenceRules: React.Dispatch<React.SetStateAction<InferenceRule[]>>;
  setStates: React.Dispatch<React.SetStateAction<Record<number, ArgumentInputState>>>;
}

export function AppSidebar(props: AppSidebarProps) {
  const [showSyntax, setShowSyntax] = useState(false);
  const [showInferenceRules, setShowInferenceRules] = useState(false);
  const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);

  return (
    <div className={cn("flex", props.valid ? "bg-lime-100" : "")}>
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
                  <SidebarMenuButton
                    onClick={() => {
                      const input = document.getElementById("derivation-upload-input");
                      if (input !== null) {
                        input.click();
                      }
                    }}
                    tooltip="Upload derivation"
                  >
                    <Upload />
                    <span>Import derivation (JSON only)</span>
                  </SidebarMenuButton>
                  <input
                    id="derivation-upload-input"
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files !== null && e.target.files.length > 0) {
                        e.target.files[0]
                          .text()
                          .then((text) => {
                            // TODO: display parsing errors
                            const states = importDerivation(text);
                            props.setStates(states);
                          })
                          .catch((reason: unknown) => {
                            console.error(reason);
                          });
                      }
                      e.target.value = ""; // Trigger onChange even when user selects the same file multiple times
                    }}
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton tooltip="Export derivation">
                        <Download />
                        <span>Export derivation</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuLabel>File format</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>LaTeX</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          exportDerivation(props.states);
                        }}
                      >
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Export rule definitions">
                    <Download />
                    <span>Export rule definitions</span>
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
                  tooltip="Show syntax rules"
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
                  tooltip="Show inference rules"
                >
                  <Eye />
                  <span>Show inference rules</span>
                </SidebarMenuToggle>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuToggle
                  isActive={showSyntaxGuide}
                  onPressedChange={(pressed) => {
                    setShowSyntaxGuide(pressed);
                  }}
                  tooltip="Show syntax guide"
                >
                  <Eye />
                  <span>Show syntax guide</span>
                </SidebarMenuToggle>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      {(showSyntax || showInferenceRules || showSyntaxGuide) && (
        <div className="ml-2 py-2 flex flex-col gap-y-2 max-h-screen items-stretch">
          {showSyntax && <SyntaxViewer syntax={props.syntax} />}
          {showInferenceRules && <InferenceRulesViewer inferenceRules={props.inferenceRules} />}
          {showSyntaxGuide && <SyntaxGuideViewer />}
        </div>
      )}
    </div>
  );
}
