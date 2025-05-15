import { ConfigFileInput } from "@/components/ConfigFileInput";
import { Button } from "@/components/shadcn/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/Card";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/ToggleGroup";
import { SearchParams } from "@/lib/types/url";
import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [search, setSearch] = useState<SearchParams>({ mode: "none" });

  return (
    <div className="h-full flex flex-col items-center justify-center px-12">
      <h1 className="text-3xl font-bold mb-10">Welcome to derivation builder!</h1>
      <h2 className="mb-4">Choose an option below:</h2>
      <div className="flex justify-center gap-x-4 mb-10 w-1/2">
        <Card
          className={`flex-1 flex-grow ${search.mode === "predefined" ? "ring-2 ring-foreground border-transparent" : ""}`}
        >
          <CardHeader>
            <CardTitle>Select a predefined system</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              className="flex flex-col justify-center"
              value={search.mode === "predefined" ? search.system : undefined}
              onValueChange={(value) => {
                if (value === "natural-deduction" || value === "lambda" || value === "sequent") {
                  setSearch({ mode: "predefined", system: value });
                } else {
                  setSearch({ mode: "none" });
                }
              }}
            >
              <ToggleGroupItem value="natural-deduction" data-cy="predefined-natural-deduction">
                Natural deduction
              </ToggleGroupItem>
              <ToggleGroupItem value="lambda" data-cy="predefined-lambda">
                Lambda calculus
              </ToggleGroupItem>
              <ToggleGroupItem value="sequent" data-cy="predefined-sequent">
                Sequent calculus
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
        <Card
          className={`flex flex-col flex-1 flex-grow ${search.mode === "json" ? "ring-2 ring-foreground border-transparent" : ""}`}
        >
          <CardHeader>
            <CardTitle>Upload a JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <ConfigFileInput setSearch={setSearch} />
          </CardContent>
        </Card>
        <Card
          className={`flex flex-col flex-1 flex-grow cursor-pointer ${search.mode === "custom" ? "ring-2 ring-foreground border-transparent" : ""}`}
          onClick={() => {
            setSearch((old) => {
              if (old.mode === "custom") {
                return { mode: "none" };
              }
              return { mode: "custom" };
            });
          }}
        >
          <CardHeader>
            <CardTitle>Define your own</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">Do it later!</CardContent>
        </Card>
      </div>
      <Button disabled={search.mode === "none"}>
        <Link to="/builder" search={search}>
          Get started
        </Link>
      </Button>
    </div>
  );
}
