// components/ai/sandbox/TeachableMachine.tsx
'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  Trash2, 
  Play,
  Plus,
  Image as ImageIcon
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ClassData {
  id: string
  name: string
  samples: string[]
  color: string
}

export function TeachableMachine() {
  const [classes, setClasses] = useState<ClassData[]>([
    { id: '1', name: 'Class 1', samples: [], color: 'from-blue-400 to-blue-600' },
    { id: '2', name: 'Class 2', samples: [], color: 'from-green-400 to-green-600' }
  ])
  const [isTraining, setIsTraining] = useState(false)
  const [modelTrained, setModelTrained] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  const handleAddClass = () => {
    const colors = [
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600'
    ]
    
    const newClass: ClassData = {
      id: Date.now().toString(),
      name: `Class ${classes.length + 1}`,
      samples: [],
      color: colors[classes.length % colors.length]
    }
    
    setClasses([...classes, newClass])
  }
  
  const handleRemoveClass = (classId: string) => {
    if (classes.length <= 2) {
      showToast.error('You need at least 2 classes')
      return
    }
    setClasses(classes.filter(c => c.id !== classId))
    setModelTrained(false)
  }
  
  const handleFileUpload = (classId: string, files: FileList | null) => {
    if (!files) return
    
    const imageUrls: string[] = []
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          imageUrls.push(url)
          
          if (imageUrls.length === files.length) {
            setClasses(classes.map(c => 
              c.id === classId 
                ? { ...c, samples: [...c.samples, ...imageUrls] }
                : c
            ))
            setModelTrained(false)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }
  
  const handleRemoveSample = (classId: string, sampleIndex: number) => {
    setClasses(classes.map(c => 
      c.id === classId 
        ? { ...c, samples: c.samples.filter((_, i) => i !== sampleIndex) }
        : c
    ))
    setModelTrained(false)
  }
  
  const handleTrain = async () => {
    const hasEnoughSamples = classes.every(c => c.samples.length >= 3)
    
    if (!hasEnoughSamples) {
      showToast.error('Each class needs at least 3 samples')
      return
    }
    
    setIsTraining(true)
    
    // Simulate training
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsTraining(false)
    setModelTrained(true)
    showToast.success('Model trained successfully!')
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h3 className="text-xl font-semibold mb-2">Train Your Own Image Classifier</h3>
        <p className="text-gray-600">
          Add sample images to each class, then train your AI model
        </p>
      </div>
      
      {/* Classes */}
      <div className="space-y-4">
        {classes.map((classData) => (
          <motion.div
            key={classData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={classData.name}
                onChange={(e) => setClasses(classes.map(c => 
                  c.id === classData.id ? { ...c, name: e.target.value } : c
                ))}
                className="text-lg font-medium bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
              />
              
              <button
                onClick={() => handleRemoveClass(classData.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                disabled={classes.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {/* Sample Images */}
              {classData.samples.map((sample, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <img
                    src={sample}
                    alt={`Sample ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveSample(classData.id, index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRefs.current[classData.id]?.click()}
                className={cn(
                  "h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors",
                  classData.samples.length === 0 ? "border-gray-300" : "border-gray-200"
                )}
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Upload</span>
              </button>
              
              <input
                ref={(ref) => fileInputRefs.current[classData.id] = ref}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(classData.id, e.target.files)}
                className="hidden"
              />
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {classData.samples.length} sample{classData.samples.length !== 1 ? 's' : ''}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAddClass}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
        
        <button
          onClick={handleTrain}
          disabled={isTraining || classes.some(c => c.samples.length < 3)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
            isTraining || classes.some(c => c.samples.length < 3) ?
              "bg-gray-200 text-gray-400 cursor-not-allowed" :
              "bg-purple-500 text-white hover:bg-purple-600"
          )}
        >
          {isTraining ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Training Model...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Train Model
            </>
          )}
        </button>
      </div>
      
      {modelTrained && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
        >
          <p className="text-green-800 font-medium">
            🎉 Model trained successfully!
          </p>
          <p className="text-sm text-green-600 mt-1">
            You can now test your model with new images
          </p>
        </motion.div>
      )}
    </div>
  )
}