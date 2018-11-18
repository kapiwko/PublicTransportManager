<?php

namespace App\Controller;

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
use App\Query\GetAllBusStopGroupsQuery;
use App\Query\GetAllBusStopsQuery;
use App\Query\GetAllConnectionsQuery;
use CrEOF\Spatial\PHP\Types\Geometry\LineString;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;

final class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function index(Request $request): Response
    {
        $data = [];
        return $this->render('default/index.html.twig', $data);
    }

    /**
     * @Route("/downloadData", name="downloadData")
     */
    public function downloadData(
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups,
        GetAllConnectionsQuery $getAllConnections
    ): Response
    {
        $data = [
            [
                'type' => 'busStop',
                'items' => $getAllBusStops(),
            ],
            [
                'type' => 'busStopGroup',
                'items' => $getAllBusStopGroups(),
            ],
            [
                'type' => 'connection',
                'items' => $getAllConnections(),
            ],
        ];
        return new JsonResponse($data);
    }

    /**
     * @Route("/uploadData", name="uploadData")
     */
    public function uploadData(
        Request $request,
        MessageBusInterface $commandBus,
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups,
        GetAllConnectionsQuery $getAllConnections
    ): Response
    {
        $commands = [
            CreateBusStopGroupCommand::class => [],
            UpdateBusStopGroupCommand::class => [],
            CreateBusStopCommand::class => [],
            UpdateBusStopCommand::class => [],
            CreateConnectionCommand::class => [],
            UpdateConnectionCommand::class => [],
            DeleteBusStopGroupCommand::class => [],
            DeleteBusStopCommand::class => [],
            DeleteConnectionCommand::class => [],
        ];

        $add = function(CommandInterface $command) use (&$commands): void {
            $commands[\get_class($command)][] = $command;
        };

        foreach (json_decode($request->getContent(), true) as $data) {
            switch ($data['type']) {
                case 'busStop':
                    $busStops = $getAllBusStops();
                    foreach ($data['items'] as $item) {
                        $id = Uuid::fromString($item['id']);
                        $busStop = $busStops->get($id);
                        $busStopData = $item['data'];
                        if ($busStopData) {
                            $location = new Point($busStopData['location'][0], $busStopData['location'][1]);
                            $group = $busStopData['group'] ? Uuid::fromString($busStopData['group']) : null;
                            if ($busStop) {
                                $add(new UpdateBusStopCommand($id, $location, $group));
                            } else {
                                $add(new CreateBusStopCommand($id, $location, $group));
                            }
                        } elseif($busStop) {
                            $add(new DeleteBusStopCommand($id));
                        }

                    }
                    break;
                case 'busStopGroup':
                    $busStopGroups = $getAllBusStopGroups();
                    foreach ($data['items'] as $item) {
                        $id = Uuid::fromString($item['id']);
                        $busStopGroup = $busStopGroups->get($id);
                        $busStopGroupData = $item['data'];
                        if ($busStopGroupData) {
                            $name = $busStopGroupData['name'];
                            if ($busStopGroup) {
                                $add(new UpdateBusStopGroupCommand($id, $name));
                            } else {
                                $add(new CreateBusStopGroupCommand($id, $name));
                            }
                        } elseif($busStopGroup) {
                            $add(new DeleteBusStopGroupCommand($id));
                        }
                    }
                    break;
                case 'connection':
                    $connections = $getAllConnections();
                    foreach ($data['items'] as $item) {
                        $id = Uuid::fromString($item['id']);
                        $connection = $connections->get($id);
                        $connectionData = $item['data'];
                        if ($connectionData) {
                            $location = new LineString(array_map(function (array $point) {
                                return new Point($point[0], $point[1]);
                            }, $connectionData['geometry']));
                            if ($connection) {
                                $add(new UpdateConnectionCommand($id, $location));
                            } else {
                                $from = $connectionData['from'] ? Uuid::fromString($connectionData['from']) : null;
                                $to = $connectionData['to'] ? Uuid::fromString($connectionData['to']) : null;
                                $add(new CreateConnectionCommand($id, $from, $to, $location));
                            }
                        } elseif($connection) {
                            $add(new DeleteConnectionCommand($id));
                        }

                    }
                    break;
            }
        }

        foreach ($commands as $group) {
            foreach ($group as $command) {
                $commandBus->dispatch($command);
            }
        }

        return new JsonResponse([]);
    }
}