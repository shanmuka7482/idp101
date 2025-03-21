import { Box, createListCollection, HStack, Input, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Switch } from '../ui/switch'
import {
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectRoot,
    SelectTrigger,
    SelectValueText
} from '../ui/select'
import { Button } from '../ui/button'
import { HiUpload } from 'react-icons/hi'
import { useAlert } from '../Alert'

function AutoBackup({ rootId }: { rootId:string }): JSX.Element {
    const [IsChecked, setIsChecked] = useState(false)
    const [selectedTime, setSelectedTime] = useState('')
    const [backupPath, setBackupPath] = useState<string>('')
    const { addAlert } = useAlert() // Now supports manual removal
    const frameworks = createListCollection({
        items: [
            { label: 'Every 6 Hours', value: '6_Hours' },
            { label: 'Daily', value: 'Daily' },
            { label: 'Weekly', value: 'Weekly' }
        ]
    })
    console.log(selectedTime)
    console.log(rootId)
    console.log(backupPath)
    const backup = async ():Promise<void> => {
        
    }

    return (
        <>
            <Box
                p={4}
                borderRadius={'lg'}
                borderColor={'gray.800'}
                borderWidth={1}
                w={'5/6'}
                bg={'gray.900/50'}
            >
                <VStack alignItems={'flex-start'} gap={2}>
                    <Text textStyle={'xl'} fontWeight={'medium'} pb={2}>
                        Automatic Backup
                    </Text>
                    <HStack
                        justifyContent={'space-between'}
                        w={'-webkit-fill-available'}
                        onClick={() => setIsChecked(!IsChecked)}
                    >
                        <VStack alignItems={'flex-start'} gap={1}>
                            <Text textStyle={'lg'}>Enable Automatic Backup</Text>
                            <Text color="gray.500" textStyle={'1sm'}>
                                Automatically backup your files at scheduled intervals
                            </Text>
                        </VStack>
                        <Switch checked={IsChecked} />
                    </HStack>
                    <SelectRoot
                        collection={frameworks}
                        size="md"
                        width="full"
                        disabled={!IsChecked}
                        onValueChange={(details: { value: string[] }) =>
                            setSelectedTime(details.value[0])
                        }
                    >
                        <SelectLabel pt={2} textStyle={'lg'} fontWeight={'normal'}>
                            Backup Frequency
                        </SelectLabel>
                        <SelectTrigger>
                            <SelectValueText placeholder="Backup Frequency..." />
                        </SelectTrigger>
                        <SelectContent>
                            {frameworks.items.map((movie) => (
                                <SelectItem item={movie} key={movie.value}>
                                    {movie.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                    <VStack alignItems={'flex-start'} w={'-webkit-fill-available'}>
                        <Text
                            textStyle={'lg'}
                            pb={1}
                            color={!IsChecked || selectedTime == '6_Hours' ? 'gray' : ''}
                        >
                            Backup Time ( for daily/weekly backups )
                        </Text>
                        <Input
                            type="time"
                            disabled={
                                !IsChecked ||
                                (selectedTime !== 'Daily' && selectedTime !== 'Weekly')
                            }
                        />
                    </VStack>
                </VStack>
            </Box>
        </>
    )
}

export default AutoBackup
