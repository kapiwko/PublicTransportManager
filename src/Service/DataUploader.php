<?php

namespace App\Service;

use App\Command\BusStop\CreateBusStopCommand;
use App\Command\BusStop\DeleteBusStopCommand;
use App\Command\BusStop\UpdateBusStopCommand;
use App\Command\BusStopGroup\CreateBusStopGroupCommand;
use App\Command\BusStopGroup\DeleteBusStopGroupCommand;
use App\Command\BusStopGroup\UpdateBusStopGroupCommand;
use App\Command\CommandInterface;
use App\Command\Connection\CreateConnectionCommand;
use App\Command\Connection\DeleteConnectionCommand;
use App\Command\Connection\UpdateConnectionCommand;
use App\ViewData\BusStopDataCollection;
use App\ViewData\BusStopGroupDataCollection;
use App\ViewData\ConnectionDataCollection;
use CrEOF\Spatial\PHP\Types\Geometry\LineString;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Messenger\MessageBusInterface;

final class DataUploader
{
    private $commandBus;
    private static $commandsOrder = [
        CreateBusStopGroupCommand::class,
        UpdateBusStopGroupCommand::class,
        CreateBusStopCommand::class,
        UpdateBusStopCommand::class,
        CreateConnectionCommand::class,
        UpdateConnectionCommand::class,
        DeleteBusStopGroupCommand::class,
        DeleteBusStopCommand::class,
        DeleteConnectionCommand::class,
    ];
    private $commands = [];

    public function __construct(MessageBusInterface $commandBus)
    {
        $this->commandBus = $commandBus;
    }

    private function add(CommandInterface $command): void
    {
        $class = \get_class($command);
        if (!array_key_exists($class, $this->commands)) {
            $this->commands[$class] = [];
        }
        $this->commands[$class][] = $command;
    }

    public function handleBusStopData(BusStopDataCollection $busStops, array $data): void
    {
        foreach ($data as $item) {
            $id = Uuid::fromString($item['id']);
            $busStop = $busStops->get($id);
            $busStopData = $item['data'];
            if ($busStopData) {
                $location = new Point($busStopData['location'][0], $busStopData['location'][1]);
                $group = $busStopData['group'] ? Uuid::fromString($busStopData['group']) : null;
                if ($busStop) {
                    $this->add(new UpdateBusStopCommand($id, $location, $group));
                } else {
                    $this->add(new CreateBusStopCommand($id, $location, $group));
                }
            } elseif($busStop) {
                $this->add(new DeleteBusStopCommand($id));
            }
        }
    }

    public function handleBusStopGroupData(BusStopGroupDataCollection $busStopGroups, array $data): void
    {
        foreach ($data as $item) {
            $id = Uuid::fromString($item['id']);
            $busStopGroup = $busStopGroups->get($id);
            $busStopGroupData = $item['data'];
            if ($busStopGroupData) {
                $name = $busStopGroupData['name'];
                if ($busStopGroup) {
                    $this->add(new UpdateBusStopGroupCommand($id, $name));
                } else {
                    $this->add(new CreateBusStopGroupCommand($id, $name));
                }
            } elseif($busStopGroup) {
                $this->add(new DeleteBusStopGroupCommand($id));
            }
        }
    }

    public function handleConnectionData(ConnectionDataCollection $connections, array $data): void
    {
        foreach ($data as $item) {
            $id = Uuid::fromString($item['id']);
            $connection = $connections->get($id);
            $connectionData = $item['data'];
            if ($connectionData) {
                $location = new LineString(array_map(function (array $point) {
                    return new Point($point[0], $point[1]);
                }, $connectionData['geometry']));
                if ($connection) {
                    $this->add(new UpdateConnectionCommand($id, $location));
                } else {
                    $from = $connectionData['from'] ? Uuid::fromString($connectionData['from']) : null;
                    $to = $connectionData['to'] ? Uuid::fromString($connectionData['to']) : null;
                    $this->add(new CreateConnectionCommand($id, $from, $to, $location));
                }
            } elseif($connection) {
                $this->add(new DeleteConnectionCommand($id));
            }
        }
    }

    public function clear(): void
    {
        $this->commands = [];
    }

    public function execute(): void
    {
        foreach (self::$commandsOrder as $class) {
            foreach ($this->commands[$class] ?? [] as $command) {
                $this->commandBus->dispatch($command);
            }
        }
        $this->clear();
    }
}