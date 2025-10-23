'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Play, FolderOpen, Download, Upload, ArrowRight, Code, FileText, Zap, Package } from 'lucide-react'

export default function InfoPage() {
  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
          <Info className="h-10 w-10 text-blue-600" />
          How PyExeKube Works
        </h1>
        <p className="text-lg text-muted-foreground">
          Understanding the execution workflow and file handling in our Kubernetes-based Python execution environment.
        </p>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              PyExeKube processes your Python code and ZIP files in a secure Kubernetes environment. 
              You can specify Python package dependencies in requirements.txt, which are automatically installed before execution.
              Your input files are automatically extracted, your code runs with access to them, 
              and any outputs you create are collected and made available for download.
            </p>
          </CardContent>
        </Card>

        {/* Step-by-Step Process */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Input Processing</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your selected ZIP file is automatically extracted into the <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded text-xs">/input</code> directory in the execution environment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">2. Dependency Installation</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    If you've specified dependencies in requirements.txt, they are automatically installed using <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded text-xs">pip install -r requirements.txt</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">3. Code Execution</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your Python code runs in a Kubernetes environment with full access to all files in the <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded text-xs">/input</code> directory.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">4. Output Generation</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Any files your code creates in the <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded text-xs">/output</code> directory are automatically collected.
                  </p>
                </div>
              </div>

                  <div className="flex items-start gap-4 p-6 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Download className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">5. Result Delivery</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Output files are zipped and uploaded to S3. You can access them in the <strong>Execution History</strong> section.
                      </p>
                    </div>
                  </div>
            </div>
          </CardContent>
        </Card>

        {/* Directory Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Directory Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg font-mono text-sm">
              <div className="text-gray-600 dark:text-gray-400 mb-2">Execution Environment:</div>
              <div className="ml-2 space-y-1">
                <div className="text-blue-600 dark:text-blue-400">├── input/</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Your ZIP file contents are extracted here</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Access files with: open("input/your_file.txt")</div>
                <div className="text-green-600 dark:text-green-400">├── output/</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Save your results here</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Example: open("output/result.csv", "w")</div>
                <div className="text-purple-600 dark:text-purple-400">├── main.py</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Your Python code</div>
                <div className="text-orange-600 dark:text-orange-400">└── requirements.txt</div>
                <div className="ml-4 text-gray-500 dark:text-gray-500"># Python package dependencies (optional)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Reading Input Files</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400"># Read a CSV file from your ZIP</div>
                <div>
                  <span className="text-blue-400">import</span> <span className="text-white">pandas</span> <span className="text-blue-400">as</span> <span className="text-white">pd</span>
                </div>
                <div>
                  <span className="text-white">df = pd.read_csv(</span><span className="text-yellow-300">"input/data.csv"</span><span className="text-white">)</span>
                </div>
                <div>
                  <span className="text-white">print(df.head())</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Saving Output Files</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400"># Process data and save results</div>
                <div>
                  <span className="text-white">processed_data = df.groupby(</span><span className="text-yellow-300">"category"</span><span className="text-white">).sum()</span>
                </div>
                <div>
                  <span className="text-white">processed_data.to_csv(</span><span className="text-yellow-300">"output/results.csv"</span><span className="text-white">)</span>
                </div>
                <div>
                  <span className="text-white">print(</span><span className="text-yellow-300">"Results saved to output/results.csv"</span><span className="text-white">)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements.txt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Python Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Using requirements.txt</h4>
              <p className="text-muted-foreground mb-4">
                You can specify Python package dependencies in the requirements.txt tab. These packages will be automatically installed before your code runs.
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400"># Example requirements.txt</div>
                <div className="text-white">requests==2.31.0</div>
                <div className="text-white">numpy==1.24.3</div>
                <div className="text-white">pandas==2.0.3</div>
                <div className="text-white">matplotlib==3.7.2</div>
                <div className="text-white">scikit-learn==1.3.0</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Best Practices for Dependencies</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Specify exact versions (e.g., <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">requests==2.31.0</code>) for reproducible builds
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Only include packages you actually use in your code
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Keep the list minimal to reduce installation time
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Test your dependencies locally before uploading
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices & Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 dark:text-green-400">✅ Do</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Use relative paths: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">"input/file.txt"</code>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Save outputs to <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">/output</code> directory
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Find output files in <strong>Execution History</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Include error handling in your code
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Test your code locally first
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Use requirements.txt for external packages
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-red-700 dark:text-red-400">❌ Don't</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Use absolute paths like <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">"/home/user/file.txt"</code>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Save files outside the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">/output</code> directory
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Upload files larger than 10MB
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Run infinite loops or long-running processes
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card>
          <CardHeader>
            <CardTitle>Limitations & Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⏱️ Execution Time</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Code execution is limited to prevent resource abuse. Very long-running processes may be terminated.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📦 File Size</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ZIP files are limited to 10MB. Large files may take longer to process and download.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🔒 Security</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Code runs in a sandboxed environment. Network access and system calls are restricted for security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
