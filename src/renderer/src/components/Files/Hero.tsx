import { Box, For, Group, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import React, { Fragment, useRef, useState } from 'react'
import { Button } from '../ui/button'
import Icons from '../../assets/Icons'
import { useAlert } from '../Alert'
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../ui/menu'

const Hero = ({
    ButtonVal,
    Count,
    rootId,
    getFiles
}: {
    ButtonVal: (value: string) => void
    Count: { Documents: number; Images: number; Videos: number; Folder: number }
    rootId: string
    getFiles: () => void
}): JSX.Element => {
    const values = [
        {
            heading: 'Documents',
            content: Count.Documents,
            icon: Icons.Documents,
            color: 'blue'
        },
        {
            heading: 'Images',
            content: Count.Images,
            icon: Icons.Images,
            color: 'pink'
        },
        {
            heading: 'Videos',
            content: Count.Videos,
            icon: Icons.Videos,
            color: 'green'
        },
        {
            heading: 'Folder',
            content: Count.Folder,
            icon: Icons.Folder,
            color: 'purple'
        },
        {
            heading: 'Upload Now',
            content: 85,
            icon: Icons.Add,
            color: 'orange'
        }
    ]
    const [activeButton, setActiveButton] = useState(null)
    const { addAlert, removeAlert } = useAlert()
    const offlineAlertId = useRef<number | null>(null) // Track the alert ID
    const uploadFile = async (filePath): Promise<void> => {
        if (filePath.length === 0) {
            console.log('no filePath provided.')
            return
        }
        try {
            console.log(filePath)
            const { id } = await window.api.fileUpload(filePath, rootId)
            console.log(id)
        } catch (error) {
            console.log('error uploading file: ', error)
        }
    }

    const uploadFolder = async (folderPath): Promise<void> => {
        try {
            await window.api.folderUpload(folderPath, rootId)
        } catch (error) {
            console.log(error)
        }
    }

    const handleFileUpload = async (): Promise<void> => {
        try {
            const multiOptions = {
                title: 'Select a File to Upload',
                buttonLabel: 'Upload',
                properties: ['openFile', 'multiSelections'] as ("openFile" | "multiSelections")[] // Allows selecting a single file
            }
            // await window.api.initWatcher(["C:/Users/prana_zhfhs6u/OneDrive/Desktop/testing","C:\\Users\\prana_zhfhs6u\\OneDrive\\Desktop\\link.txt"],rootId, 60 * 1000)

            const result = await window.api.showOpenDialog(multiOptions)

            if (result.canceled || !result.filePaths) {
                addAlert('error', 'Upload Cancelled', 2000)
                return
            }

            if (result.filePaths.length > 0) {
                // Set sticky alert
                offlineAlertId.current = addAlert('info', 'Uploading...', null, true)
                console.log('Selected paths:', result.filePaths)

                try {
                    for(let i=0;i<result.filePaths.length;i++){
                        console.log(result.filePaths[i])
                        await uploadFile(result.filePaths[i])
                    } // for multiple file upload
                    // await uploadFile(result.filePaths[0]) // for singlr file upload
                    
                    await window.api.initWatcher(result.filePaths,rootId, 60 * 1000)
                    removeAlert(offlineAlertId.current)
                    offlineAlertId.current = null
                    addAlert('success', 'Upload Completed', 2000)
                    getFiles()
                } catch (uploadError) {
                    console.error('Error during upload:', uploadError)
                    removeAlert(offlineAlertId.current)
                    offlineAlertId.current = null
                    addAlert('error', 'Upload Failed', 2000)
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error)
            addAlert('error', 'Something went wrong', 2000)
        }
    }

    const handleFolderUpload = async (): Promise<void> => {
        try {
            console.log('Folder Upload function called')
            const multiOptions = {
                title: 'Select a File to Upload',
                buttonLabel: 'Upload',
                properties: ['openDirectory' , 'multiSelections'] as ("openDirectory" | "multiSelections")[] // Allows selecting a folder
            }

            const result = await window.api.showOpenDialog(multiOptions)

            if (result.canceled || !result.filePaths) {
                addAlert('error', 'Upload Cancelled', 2000)
                return
            }

            if (result.filePaths.length > 0) {
                // Set sticky alert
                offlineAlertId.current = addAlert('info', 'Uploading...', null, true)
                console.log('Selected Folder:', result.filePaths)

                try {
                    for(let i=0;i<result.filePaths.length;i++){
                        console.log(result.filePaths[i])
                        await uploadFolder(result.filePaths[i])
                    } // for multiple file upload
                    await uploadFolder(result.filePaths[0]) // Ensure upload completes before removing alert
                    
                    await window.api.initWatcher(result.filePaths,rootId, 60 * 1000)

                    removeAlert(offlineAlertId.current)
                    offlineAlertId.current = null
                    addAlert('success', 'Upload Completed', 2000)
                    getFiles()
                } catch (uploadError) {
                    console.error('Error during upload:', uploadError)
                    removeAlert(offlineAlertId.current)
                    offlineAlertId.current = null
                    addAlert('error', 'Upload Failed', 2000)
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error)
            addAlert('error', 'Something went wrong', 2000)
        }
    }

    const handleButtonClick = (index, val): void => {
        if (val === 'Upload Now') {
            return
        }
        if (activeButton === index) {
            // If the same button is clicked again, deactivate it and send an empty value
            setActiveButton(null)
            ButtonVal('')
        } else {
            // Otherwise, activate the button and send its value
            setActiveButton(index)
            ButtonVal(val)
        }
    }

    return (
        <>
            <Group grow w={'full'}>
                <For each={values}>
                    {(item, index) => (
                        <Fragment key={index}>
                            {item.heading === 'Upload Now' ? (
                                <MenuRoot key={index}>
                                    <MenuTrigger asChild>
                                        <Button
                                            key={index}
                                            variant={activeButton === index ? 'subtle' : 'plain'}
                                            w={'1/4'}
                                            p={3}
                                            justifyContent={'flex-start'}
                                            borderRadius={'lg'}
                                            h={'max-content'}
                                            _hover={{ borderColor: `${item.color}.400` }}
                                            borderColor={
                                                activeButton === index
                                                    ? `${item.color}.400/60`
                                                    : 'gray.800'
                                            }
                                            bgColor={
                                                activeButton === index ? `${item.color}.800/10` : ''
                                            }
                                        >
                                            <HStack>
                                                <Box
                                                    p={3}
                                                    bg={`${item.color}.800/10`}
                                                    borderRadius={'lg'}
                                                >
                                                    <Icon
                                                        fontSize="2xl"
                                                        color={`${item.color}.400`}
                                                        as={item.icon}
                                                    />
                                                </Box>
                                                <Box pl={4}>
                                                    <VStack alignItems={'flex-start'} gap={1}>
                                                        <Text
                                                            fontSize="xl"
                                                            fontWeight={'medium'}
                                                            color={'white'}
                                                        >
                                                            {item.heading}
                                                        </Text>
                                                        <Text color={'gray.400'}></Text>
                                                    </VStack>
                                                </Box>
                                            </HStack>
                                        </Button>
                                    </MenuTrigger>
                                    <MenuContent>
                                        <MenuItem value="Upload file" onClick={handleFileUpload}>
                                            Upload File...
                                        </MenuItem>
                                        <MenuItem
                                            value="Upload Folder"
                                            onClick={handleFolderUpload}
                                        >
                                            Upload Folder...
                                        </MenuItem>
                                    </MenuContent>
                                </MenuRoot>
                            ) : (
                                <Button
                                    key={index}
                                    variant={activeButton === index ? 'subtle' : 'plain'}
                                    w={'1/4'}
                                    p={3}
                                    justifyContent={'flex-start'}
                                    borderRadius={'lg'}
                                    h={'max-content'}
                                    onClick={() => handleButtonClick(index, item.heading)}
                                    _hover={{ borderColor: `${item.color}.400` }}
                                    borderColor={
                                        activeButton === index ? `${item.color}.400/60` : 'gray.800'
                                    }
                                    bgColor={activeButton === index ? `${item.color}.800/10` : ''}
                                >
                                    <HStack>
                                        <Box p={3} bg={`${item.color}.800/10`} borderRadius={'lg'}>
                                            <Icon
                                                fontSize="2xl"
                                                color={`${item.color}.400`}
                                                as={item.icon}
                                            />
                                        </Box>
                                        <Box pl={4}>
                                            <VStack alignItems={'flex-start'} gap={1}>
                                                <Text
                                                    fontSize="xl"
                                                    fontWeight={'medium'}
                                                    color={'white'}
                                                >
                                                    {item.heading}
                                                </Text>
                                                <Text color={'gray.400'}>{item.content} Files</Text>
                                            </VStack>
                                        </Box>
                                    </HStack>
                                </Button>
                            )}
                        </Fragment>
                    )}
                </For>
            </Group>
        </>
    )
}

export default Hero
