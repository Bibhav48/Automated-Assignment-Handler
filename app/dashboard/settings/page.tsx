import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"

interface Settings {
  canvasApiKey: string
  syncInterval: number
  autoSync: boolean
  notificationEmail: string
  maxRetries: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    canvasApiKey: "",
    syncInterval: 15,
    autoSync: true,
    notificationEmail: "",
    maxRetries: 3,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Canvas Integration</CardTitle>
            <CardDescription>
              Configure your Canvas API settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Canvas API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.canvasApiKey}
                onChange={(e) =>
                  setSettings({ ...settings, canvasApiKey: e.target.value })
                }
                placeholder="Enter your Canvas API key"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure how assignments are synced
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync assignments at regular intervals
                </p>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSync: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="1"
                value={settings.syncInterval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    syncInterval: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRetries">Maximum Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                min="0"
                value={settings.maxRetries}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxRetries: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                value={settings.notificationEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationEmail: e.target.value,
                  })
                }
                placeholder="Enter your email for notifications"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
} 